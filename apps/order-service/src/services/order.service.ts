import { prisma } from "@unkora/database";
import { redis, REDIS_KEYS } from "@unkora/database";
import {
  generateOrderNumber,
  buildPaginationMeta,
  HttpError,
  createLogger,
  formatBDT,
} from "@unkora/utils";

const logger = createLogger("order-service");
const STOCK_RESERVE_TTL = 15 * 60; // 15 minutes

export class OrderService {
  // ── CART ─────────────────────────────────────

  async getOrCreateCart(userId?: string, sessionId?: string) {
    if (userId) {
      const cart = await prisma.cart.findUnique({
        where: { user_id: userId },
        include: { items: { include: { product: { include: { images: { where: { is_primary: true }, take: 1 } } }, variant: true } } },
      });
      if (cart) return cart;
      return prisma.cart.create({ data: { user_id: userId }, include: { items: true } });
    }
    if (sessionId) {
      const cart = await prisma.cart.findUnique({
        where: { session_id: sessionId },
        include: { items: { include: { product: true, variant: true } } },
      });
      if (cart) return cart;
      return prisma.cart.create({ data: { session_id: sessionId }, include: { items: true } });
    }
    throw HttpError.BadRequest("userId or sessionId required");
  }

  async addToCart(cartId: string, productId: string, quantity: number, variantId?: string) {
    const product = await prisma.product.findUnique({ where: { id: productId, publish_status: "PUBLISHED" } });
    if (!product) throw HttpError.NotFound("Product not found", "PRODUCT_NOT_FOUND", "পণ্য পাওয়া যায়নি");

    const stockToCheck = variantId
      ? (await prisma.productVariant.findUnique({ where: { id: variantId } }))?.stock_quantity ?? 0
      : product.stock_quantity;

    const existing = await prisma.cartItem.findFirst({ where: { cart_id: cartId, product_id: productId, variant_id: variantId ?? null } });
    const newQty = (existing?.quantity ?? 0) + quantity;

    if (newQty > stockToCheck) {
      throw HttpError.BadRequest(`Only ${stockToCheck} items available`, "INSUFFICIENT_STOCK", `মাত্র ${stockToCheck} টি পাওয়া যাচ্ছে`);
    }

    const unitPrice = product.sale_price ?? product.base_price;

    if (existing) {
      return prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: newQty } });
    }
    return prisma.cartItem.create({
      data: { cart_id: cartId, product_id: productId, variant_id: variantId ?? null, quantity, unit_price: unitPrice },
    });
  }

  async mergeGuestCart(guestSessionId: string, userId: string) {
    const guestCart = await prisma.cart.findUnique({
      where: { session_id: guestSessionId },
      include: { items: true },
    });
    if (!guestCart?.items.length) return;

    const userCart = await this.getOrCreateCart(userId);
    for (const item of guestCart.items) {
      await this.addToCart(userCart.id, item.product_id, item.quantity, item.variant_id ?? undefined);
    }
    await prisma.cart.delete({ where: { id: guestCart.id } });
    logger.info(`Merged guest cart into user ${userId}`);
  }

  // ── COUPON ────────────────────────────────────

  async applyCoupon(cartId: string, code: string, subtotal: number) {
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        is_active: true,
        valid_from: { lte: new Date() },
        valid_until: { gte: new Date() },
      },
    });

    if (!coupon) throw HttpError.BadRequest("Invalid or expired coupon", "COUPON_INVALID", "কুপন কোড অবৈধ বা মেয়াদ শেষ");

    if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
      throw HttpError.BadRequest(
        `Minimum order ${formatBDT(coupon.min_order_amount)} required`,
        "COUPON_MIN_ORDER",
        `ন্যূনতম ${formatBDT(coupon.min_order_amount)} অর্ডার প্রয়োজন`
      );
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      throw HttpError.BadRequest("Coupon usage limit reached", "COUPON_EXHAUSTED", "কুপন সীমা শেষ হয়েছে");
    }

    let discount = 0;
    if (coupon.type === "PERCENTAGE") {
      discount = Math.round(subtotal * coupon.value / 100);
      if (coupon.max_discount_amount) discount = Math.min(discount, coupon.max_discount_amount);
    } else if (coupon.type === "FIXED_AMOUNT") {
      discount = Math.min(coupon.value, subtotal);
    }

    await prisma.cart.update({ where: { id: cartId }, data: { coupon_code: code.toUpperCase() } });
    return { discount, coupon };
  }

  // ── CHECKOUT ──────────────────────────────────

  async checkout(params: {
    userId: string;
    paymentMethod: string;
    shippingAddressId: string;
    deliveryMethod?: string;
    couponCode?: string;
    notes?: string;
    sessionId?: string;
  }) {
    const cart = await prisma.cart.findUnique({
      where: { user_id: params.userId },
      include: { items: { include: { product: true, variant: true } } },
    });

    if (!cart?.items.length) {
      throw HttpError.BadRequest("Cart is empty", "EMPTY_CART", "কার্ট খালি");
    }

    const address = await prisma.address.findFirst({
      where: { id: params.shippingAddressId, user_id: params.userId },
    });
    if (!address) throw HttpError.BadRequest("Invalid shipping address", "INVALID_ADDRESS");

    // Validate stock & build order items
    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const stockQty = item.variant?.stock_quantity ?? item.product.stock_quantity;
      if (stockQty < item.quantity) {
        throw HttpError.BadRequest(
          `"${item.product.name_en}" has only ${stockQty} left`,
          "OUT_OF_STOCK",
          `"${item.product.name_bn}" এর মাত্র ${stockQty} টি বাকি আছে`
        );
      }

      const unitPrice = item.variant
        ? (item.product.sale_price ?? item.product.base_price) + item.variant.price_modifier
        : (item.product.sale_price ?? item.product.base_price);
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_name_en: item.product.name_en,
        product_name_bn: item.product.name_bn,
        product_image: "",
        sku: item.product.sku,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        vendor_id: item.product.vendor_id,
      });
    }

    // Coupon
    let discountAmount = 0;
    const couponCode = params.couponCode ?? cart.coupon_code;
    if (couponCode) {
      try {
        const { discount } = await this.applyCoupon(cart.id, couponCode, subtotal);
        discountAmount = discount;
      } catch { /* ignore invalid coupons at checkout */ }
    }

    // Delivery cost
    const zone = await prisma.deliveryZone.findFirst({
      where: { district: address.district, is_serviceable: true },
    });
    const isExpress = params.deliveryMethod === "EXPRESS";
    const shippingCost = subtotal >= 99900 ? 0 : (isExpress ? (zone?.express_cost ?? 15000) : (zone?.standard_cost ?? 6000));
    const totalAmount = subtotal - discountAmount + shippingCost;

    const shippingAddress = {
      recipient_name: address.recipient_name,
      phone: address.phone,
      division: address.division,
      district: address.district,
      upazila: address.upazila,
      union: address.union,
      street: address.street,
      postal_code: address.postal_code,
    };

    // Create order atomically
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          order_number: generateOrderNumber(),
          user_id: params.userId,
          status: "PENDING",
          subtotal,
          shipping_cost: shippingCost,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          payment_status: "UNPAID",
          payment_method: params.paymentMethod as Parameters<typeof tx.order.create>[0]["data"]["payment_method"],
          shipping_address: shippingAddress,
          delivery_method: isExpress ? "EXPRESS" : "STANDARD",
          coupon_code: couponCode,
          notes: params.notes,
          items: { createMany: { data: orderItems } },
          status_history: {
            create: { status: "PENDING", note: "Order placed", actor_id: params.userId, actor_role: "CUSTOMER" },
          },
        },
        include: { items: true },
      });

      // Reserve stock
      for (const item of cart.items) {
        const reserveKey = REDIS_KEYS.stockReserve(newOrder.id, item.product_id);
        await redis.setex(reserveKey, STOCK_RESERVE_TTL, String(item.quantity));

        if (item.variant_id) {
          await tx.productVariant.update({
            where: { id: item.variant_id },
            data: { stock_quantity: { decrement: item.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: item.product_id },
            data: { stock_quantity: { decrement: item.quantity } },
          });
        }
      }

      // Update coupon usage
      if (couponCode) {
        await tx.coupon.update({
          where: { code: couponCode.toUpperCase() },
          data: { used_count: { increment: 1 } },
        });
      }

      // Split by vendor
      const vendorMap = new Map<string, typeof orderItems>();
      for (const item of orderItems) {
        if (!item.vendor_id) continue;
        const existing = vendorMap.get(item.vendor_id) ?? [];
        existing.push(item);
        vendorMap.set(item.vendor_id, existing);
      }

      for (const [vendorId, items] of vendorMap) {
        const vendor = await tx.vendor.findUnique({ where: { id: vendorId }, select: { commission_rate: true } });
        const vendorSubtotal = items.reduce((s, i) => s + i.total_price, 0);
        const commissionAmount = Math.round(vendorSubtotal * ((vendor?.commission_rate ?? 10) / 100));
        await tx.vendorSubOrder.create({
          data: {
            order_id: newOrder.id,
            vendor_id: vendorId,
            subtotal: vendorSubtotal,
            commission_amount: commissionAmount,
            vendor_payout: vendorSubtotal - commissionAmount,
            status: "PENDING",
          },
        });
      }

      // Clear cart
      await tx.cart.update({ where: { id: cart.id }, data: { coupon_code: null } });
      await tx.cartItem.deleteMany({ where: { cart_id: cart.id } });

      return newOrder;
    });

    logger.info(`Order created: ${order.order_number}`);
    return order;
  }

  // ── ORDER MANAGEMENT ─────────────────────────

  async getOrders(userId: string, page: number, perPage: number, role: string) {
    const where = role === "CUSTOMER" ? { user_id: userId, deleted_at: null } : { deleted_at: null };
    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { created_at: "desc" },
        include: {
          items: { take: 3, select: { product_name_en: true, product_name_bn: true, quantity: true, product_image: true } },
          payment: { select: { status: true, gateway: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);
    return { data, meta: buildPaginationMeta(total, page, perPage) };
  }

  async getOrderByNumber(orderNumber: string, userId: string, role: string) {
    const where = role === "CUSTOMER"
      ? { order_number: orderNumber, user_id: userId }
      : { order_number: orderNumber };

    const order = await prisma.order.findFirst({
      where,
      include: {
        items: { include: { product: { select: { name_en: true, slug: true } } } },
        status_history: { orderBy: { timestamp: "asc" } },
        payment: true,
        delivery: { include: { tracking_events: { orderBy: { timestamp: "asc" } } } },
        vendor_sub_orders: { include: { vendor: { select: { shop_name_en: true, shop_name_bn: true } } } },
      },
    });

    if (!order) throw HttpError.NotFound("Order not found", "ORDER_NOT_FOUND", "অর্ডার পাওয়া যায়নি");
    return order;
  }

  async cancelOrder(orderId: string, userId: string, reason: string) {
    const order = await prisma.order.findFirst({ where: { id: orderId, user_id: userId } });
    if (!order) throw HttpError.NotFound("Order not found");

    const cancellable: string[] = ["PENDING", "CONFIRMED"];
    if (!cancellable.includes(order.status)) {
      throw HttpError.BadRequest("Order cannot be cancelled at this stage", "CANCEL_NOT_ALLOWED", "এই পর্যায়ে অর্ডার বাতিল করা যাবে না");
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      }),
      prisma.orderStatusHistory.create({
        data: { order_id: orderId, status: "CANCELLED", note: reason, actor_id: userId, actor_role: "CUSTOMER" },
      }),
    ]);

    // Restore stock
    const items = await prisma.orderItem.findMany({ where: { order_id: orderId } });
    for (const item of items) {
      if (item.variant_id) {
        await prisma.productVariant.update({ where: { id: item.variant_id }, data: { stock_quantity: { increment: item.quantity } } });
      } else {
        await prisma.product.update({ where: { id: item.product_id }, data: { stock_quantity: { increment: item.quantity } } });
      }
    }
  }
}

export const orderService = new OrderService();
