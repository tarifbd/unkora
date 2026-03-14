import { Request, Response } from "express";
import { asyncHandler, buildPaginationMeta, parsePagination, HttpError, generateOrderNumber } from "@unkora/utils";
import { prisma } from "@unkora/database";

export class OrderController {
  checkout = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body as {
      cart_id: string; payment_method: string; shipping_address_id: string;
      delivery_method?: string; coupon_code?: string; notes?: string;
    };

    const cart = await prisma.cart.findUnique({ where: { id: data.cart_id }, include: { items: { include: { product: true, variant: true } } } });
    if (!cart || cart.items.length === 0) throw HttpError.BadRequest("Cart is empty", "EMPTY_CART", "কার্ট খালি");

    const address = await prisma.address.findFirst({ where: { id: data.shipping_address_id, user_id: req.user!.id } });
    if (!address) throw HttpError.BadRequest("Invalid shipping address");

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const unitPrice = item.product.sale_price ?? item.product.base_price;
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      // Check stock
      if (item.product.stock_quantity < item.quantity) throw HttpError.BadRequest(`Insufficient stock for ${item.product.name_en}`, "OUT_OF_STOCK");

      orderItems.push({
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_name_en: item.product.name_en,
        product_name_bn: item.product.name_bn,
        product_image: item.product.images?.[0]?.url ?? "",
        sku: item.product.sku,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        vendor_id: item.product.vendor_id,
      });
    }

    // Apply coupon
    let discountAmount = 0;
    if (cart.coupon_code) {
      const coupon = await prisma.coupon.findFirst({ where: { code: cart.coupon_code, is_active: true } });
      if (coupon) {
        if (coupon.type === "PERCENTAGE") discountAmount = Math.round(subtotal * coupon.value / 100);
        else if (coupon.type === "FIXED_AMOUNT") discountAmount = Math.min(coupon.value, subtotal);
        if (coupon.max_discount_amount) discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
        await prisma.coupon.update({ where: { id: coupon.id }, data: { used_count: { increment: 1 } } });
      }
    }

    // Shipping cost
    const zone = await prisma.deliveryZone.findFirst({ where: { district: address.district } });
    const deliveryMethod = data.delivery_method ?? "STANDARD";
    const shippingCost = zone ? (deliveryMethod === "EXPRESS" ? zone.express_cost : zone.standard_cost) : 10000;

    const totalAmount = subtotal - discountAmount + shippingCost;
    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        order_number: orderNumber,
        user_id: req.user!.id,
        payment_method: data.payment_method as Parameters<typeof prisma.order.create>[0]["data"]["payment_method"],
        subtotal, shipping_cost: shippingCost, discount_amount: discountAmount, total_amount: totalAmount,
        shipping_address: { recipient_name: address.recipient_name, phone: address.phone, division: address.division, district: address.district, upazila: address.upazila, street: address.street },
        delivery_method: (deliveryMethod as "STANDARD" | "EXPRESS"),
        coupon_code: cart.coupon_code,
        notes: data.notes,
        items: { create: orderItems },
        status_history: { create: [{ status: "PENDING", note: "Order placed" }] },
      },
    });

    // Deduct stock
    for (const item of cart.items) {
      await prisma.product.update({ where: { id: item.product_id }, data: { stock_quantity: { decrement: item.quantity }, sales_count: { increment: item.quantity } } });
    }

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { cart_id: cart.id } });

    res.status(201).json({ success: true, data: { order_id: order.id, order_number: order.order_number, total_amount: order.total_amount } });
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const { skip, take, page, perPage } = parsePagination(req.query as Record<string, string>);
    const [data, total] = await Promise.all([
      prisma.order.findMany({ where: { user_id: req.user!.id, deleted_at: null }, skip, take, orderBy: { created_at: "desc" }, include: { items: true, payment: { select: { status: true, gateway: true } } } }),
      prisma.order.count({ where: { user_id: req.user!.id, deleted_at: null } }),
    ]);
    res.json({ success: true, data, meta: buildPaginationMeta(total, page, perPage) });
  });

  getByNumber = asyncHandler(async (req: Request, res: Response) => {
    const order = await prisma.order.findFirst({
      where: { order_number: req.params["orderNumber"]! },
      include: { items: { include: { product: { select: { slug: true, images: { where: { is_primary: true }, take: 1 } } } } }, status_history: { orderBy: { timestamp: "desc" } }, payment: true, delivery: { include: { tracking_events: { orderBy: { timestamp: "desc" } } } } },
    });
    if (!order) throw HttpError.NotFound("Order not found");
    if (order.user_id !== req.user!.id && !["ADMIN","SUPER_ADMIN"].includes(req.user!.role)) throw HttpError.Forbidden("Access denied");
    res.json({ success: true, data: order });
  });

  getInvoice = asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, message: "Invoice generation endpoint - integrate PDFKit" });
  });

  cancel = asyncHandler(async (req: Request, res: Response) => {
    const order = await prisma.order.findFirst({ where: { id: req.params["id"]!, user_id: req.user!.id } });
    if (!order) throw HttpError.NotFound("Order not found");
    if (!["PENDING","CONFIRMED"].includes(order.status)) throw HttpError.BadRequest("Order cannot be cancelled at this stage");
    await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED", status_history: { create: [{ status: "CANCELLED", note: "Cancelled by customer", actor_id: req.user!.id, actor_role: req.user!.role }] } } });
    res.json({ success: true, message: "Order cancelled" });
  });

  requestReturn = asyncHandler(async (req: Request, res: Response) => {
    const { reason } = req.body as { reason: string };
    const order = await prisma.order.findFirst({ where: { id: req.params["id"]!, user_id: req.user!.id } });
    if (!order) throw HttpError.NotFound("Order not found");
    if (order.status !== "DELIVERED") throw HttpError.BadRequest("Only delivered orders can be returned");
    await prisma.order.update({ where: { id: order.id }, data: { status: "RETURN_REQUESTED", admin_notes: `Return reason: ${reason}`, status_history: { create: [{ status: "RETURN_REQUESTED", note: reason, actor_id: req.user!.id }] } } });
    res.json({ success: true, message: "Return request submitted" });
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status, note } = req.body as { status: string; note?: string };
    const order = await prisma.order.update({
      where: { id: req.params["id"]! },
      data: { status: status as Parameters<typeof prisma.order.update>[0]["data"]["status"], status_history: { create: [{ status: status as Parameters<typeof prisma.order.update>[0]["data"]["status"], note, actor_id: req.user!.id, actor_role: req.user!.role }] } },
    });
    res.json({ success: true, data: order });
  });

  adminList = asyncHandler(async (req: Request, res: Response) => {
    const { skip, take, page, perPage } = parsePagination(req.query as Record<string, string>);
    const q = req.query as Record<string, string>;
    const where: Record<string, unknown> = { deleted_at: null };
    if (q["status"]) where["status"] = q["status"];
    if (q["payment_status"]) where["payment_status"] = q["payment_status"];
    const [data, total] = await Promise.all([
      prisma.order.findMany({ where, skip, take, orderBy: { created_at: "desc" }, include: { user: { select: { name_en: true, phone: true } }, payment: { select: { status: true, gateway: true } } } }),
      prisma.order.count({ where }),
    ]);
    res.json({ success: true, data, meta: buildPaginationMeta(total, page, perPage) });
  });
}
