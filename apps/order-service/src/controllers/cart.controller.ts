import { Request, Response } from "express";
import { asyncHandler, HttpError } from "@unkora/utils";
import { prisma } from "@unkora/database";
import { redis } from "@unkora/database";

export class CartController {
  private getCartId(req: Request): { userId?: string; sessionId?: string } {
    if (req.user?.id) return { userId: req.user.id };
    const sessionId = req.headers["x-session-id"] as string | undefined;
    if (!sessionId) throw HttpError.BadRequest("Session ID required for guest cart");
    return { sessionId };
  }

  getCart = asyncHandler(async (req: Request, res: Response) => {
    const { userId, sessionId } = this.getCartId(req);
    const cart = await prisma.cart.findFirst({
      where: userId ? { user_id: userId } : { session_id: sessionId },
      include: {
        items: {
          include: {
            product: { select: { id: true, slug: true, name_en: true, name_bn: true, base_price: true, sale_price: true, stock_quantity: true, images: { where: { is_primary: true }, take: 1 } } },
            variant: true,
          },
        },
      },
    });
    res.json({ success: true, data: cart ?? { items: [] } });
  });

  addItem = asyncHandler(async (req: Request, res: Response) => {
    const { userId, sessionId } = this.getCartId(req);
    const { product_id, variant_id, quantity } = req.body as { product_id: string; variant_id?: string; quantity: number };

    const product = await prisma.product.findUnique({ where: { id: product_id, publish_status: "PUBLISHED", is_active: true } });
    if (!product) throw HttpError.NotFound("Product not found or unavailable");
    if (product.stock_quantity < quantity) throw HttpError.BadRequest("Insufficient stock", "OUT_OF_STOCK", "পর্যাপ্ত স্টক নেই");

    const unitPrice = product.sale_price ?? product.base_price;

    let cart = await prisma.cart.findFirst({ where: userId ? { user_id: userId } : { session_id: sessionId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { user_id: userId ?? null, session_id: sessionId ?? null, expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } });
    }

    await prisma.cartItem.upsert({
      where: { cart_id_product_id_variant_id: { cart_id: cart.id, product_id, variant_id: variant_id ?? null } },
      create: { cart_id: cart.id, product_id, variant_id: variant_id ?? null, quantity, unit_price: unitPrice },
      update: { quantity: { increment: quantity } },
    });

    res.status(201).json({ success: true, message: "Added to cart", message_bn: "কার্টে যোগ হয়েছে" });
  });

  updateItem = asyncHandler(async (req: Request, res: Response) => {
    const { quantity } = req.body as { quantity: number };
    if (quantity <= 0) { await prisma.cartItem.delete({ where: { id: req.params["itemId"]! } }); res.json({ success: true }); return; }
    const item = await prisma.cartItem.update({ where: { id: req.params["itemId"]! }, data: { quantity } });
    res.json({ success: true, data: item });
  });

  removeItem = asyncHandler(async (req: Request, res: Response) => {
    await prisma.cartItem.delete({ where: { id: req.params["itemId"]! } });
    res.json({ success: true, message: "Item removed" });
  });

  clearCart = asyncHandler(async (req: Request, res: Response) => {
    const { userId, sessionId } = this.getCartId(req);
    const cart = await prisma.cart.findFirst({ where: userId ? { user_id: userId } : { session_id: sessionId } });
    if (cart) await prisma.cartItem.deleteMany({ where: { cart_id: cart.id } });
    res.json({ success: true, message: "Cart cleared" });
  });

  applyCoupon = asyncHandler(async (req: Request, res: Response) => {
    const { code, cart_id } = req.body as { code: string; cart_id: string };
    const coupon = await prisma.coupon.findFirst({
      where: { code: code.toUpperCase(), is_active: true, valid_from: { lte: new Date() }, valid_until: { gte: new Date() } },
    });
    if (!coupon) throw HttpError.BadRequest("Invalid or expired coupon", "INVALID_COUPON", "কুপনটি বৈধ নয়");
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) throw HttpError.BadRequest("Coupon usage limit reached", "COUPON_EXHAUSTED");

    await prisma.cart.update({ where: { id: cart_id }, data: { coupon_code: coupon.code } });
    res.json({ success: true, data: { coupon, message: "Coupon applied" } });
  });

  removeCoupon = asyncHandler(async (req: Request, res: Response) => {
    const { cart_id } = req.body as { cart_id: string };
    await prisma.cart.update({ where: { id: cart_id }, data: { coupon_code: null } });
    res.json({ success: true, message: "Coupon removed" });
  });

  mergeGuestCart = asyncHandler(async (req: Request, res: Response) => {
    const { session_id } = req.body as { session_id: string };
    const guestCart = await prisma.cart.findFirst({ where: { session_id }, include: { items: true } });
    if (!guestCart) { res.json({ success: true, message: "Nothing to merge" }); return; }

    let userCart = await prisma.cart.findFirst({ where: { user_id: req.user!.id } });
    if (!userCart) {
      userCart = await prisma.cart.create({ data: { user_id: req.user!.id, expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } });
    }

    for (const item of guestCart.items) {
      await prisma.cartItem.upsert({
        where: { cart_id_product_id_variant_id: { cart_id: userCart.id, product_id: item.product_id, variant_id: item.variant_id } },
        create: { cart_id: userCart.id, product_id: item.product_id, variant_id: item.variant_id, quantity: item.quantity, unit_price: item.unit_price },
        update: { quantity: { increment: item.quantity } },
      });
    }

    await prisma.cart.delete({ where: { id: guestCart.id } });
    res.json({ success: true, message: "Cart merged" });
  });
}
