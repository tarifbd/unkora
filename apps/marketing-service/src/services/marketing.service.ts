import { prisma } from "@unkora/database";
import { redis } from "@unkora/database";
import { createLogger } from "@unkora/utils";
import axios from "axios";

const logger = createLogger("marketing-service");

// ─────────────────────────────────────────────
// ABANDONED CART RECOVERY
// ─────────────────────────────────────────────

export class AbandonedCartService {
  // Called by BullMQ job every 30 min
  async findAbandonedCarts(): Promise<void> {
    const oneHourAgo = new Date(Date.now() - 3600_000);
    const threeDaysAgo = new Date(Date.now() - 3 * 86400_000);

    const carts = await prisma.cart.findMany({
      where: {
        user_id: { not: null },
        updated_at: { lte: oneHourAgo, gte: threeDaysAgo },
        items: { some: {} },
      },
      include: {
        user: { select: { id: true, name_en: true, name_bn: true, email: true, phone: true } },
        items: {
          take: 3,
          include: { product: { select: { name_bn: true, base_price: true, sale_price: true, images: { where: { is_primary: true }, take: 1 } } } },
        },
      },
    });

    for (const cart of carts) {
      if (!cart.user) continue;
      const lockKey = `abandoned_cart:sent:${cart.id}`;
      const alreadySent = await redis.exists(lockKey);
      if (alreadySent) continue;

      await this.sendAbandonedCartSequence(cart);
      await redis.setex(lockKey, 86400 * 3, "1");
    }

    logger.info(`Processed ${carts.length} abandoned carts`);
  }

  private async sendAbandonedCartSequence(cart: {
    id: string;
    user: { id: string; name_bn: string; email?: string | null; phone?: string | null } | null;
    items: { product: { name_bn: string; base_price: number; sale_price?: number | null } | null }[];
  }): Promise<void> {
    if (!cart.user) return;
    const productNames = cart.items.map((i) => i.product?.name_bn ?? "").filter(Boolean).join(", ");

    // Step 1: SMS after 1 hour
    if (cart.user.phone) {
      await this.scheduleJob("send-abandoned-cart-sms", {
        phone: cart.user.phone,
        name: cart.user.name_bn,
        products: productNames,
        cart_id: cart.id,
      }, 0); // immediately (already 1h old by detection)
    }

    // Step 2: Email after 3 hours (2h more delay)
    if (cart.user.email) {
      await this.scheduleJob("send-abandoned-cart-email", {
        email: cart.user.email,
        name: cart.user.name_bn,
        products: productNames,
        cart_id: cart.id,
        has_coupon: false,
      }, 2 * 3600_000);
    }

    // Step 3: Email with coupon after 24 hours
    if (cart.user.email) {
      await this.scheduleJob("send-abandoned-cart-email", {
        email: cart.user.email,
        name: cart.user.name_bn,
        products: productNames,
        cart_id: cart.id,
        has_coupon: true,
        coupon_discount: 10,
      }, 23 * 3600_000);
    }
  }

  private async scheduleJob(name: string, data: Record<string, unknown>, delayMs: number): Promise<void> {
    // In production, push to BullMQ. For now, log.
    logger.info(`Scheduled job: ${name} in ${delayMs / 1000}s`, data);
    await redis.setex(
      `job:${name}:${Date.now()}`,
      Math.floor(delayMs / 1000) + 3600,
      JSON.stringify({ name, data, executeAt: Date.now() + delayMs })
    );
  }
}

// ─────────────────────────────────────────────
// LOYALTY SERVICE
// ─────────────────────────────────────────────

export const LOYALTY_TIERS = {
  BRONZE:   { min: 0,    max: 499,  discount: 0,   name_bn: "ব্রোঞ্জ" },
  SILVER:   { min: 500,  max: 1999, discount: 2,   name_bn: "সিলভার" },
  GOLD:     { min: 2000, max: 4999, discount: 5,   name_bn: "গোল্ড" },
  PLATINUM: { min: 5000, max: Infinity, discount: 10, name_bn: "প্লাটিনাম" },
};

export class LoyaltyService {
  async getUserLoyalty(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { loyalty_points: true, loyalty_tier: true },
    });
    if (!user) return null;

    const tier = LOYALTY_TIERS[user.loyalty_tier as keyof typeof LOYALTY_TIERS];
    const nextTier = this.getNextTier(user.loyalty_tier);

    return {
      points: user.loyalty_points,
      tier: user.loyalty_tier,
      tier_name_bn: tier?.name_bn ?? "ব্রোঞ্জ",
      discount_percent: tier?.discount ?? 0,
      next_tier: nextTier,
      points_to_next: nextTier ? (LOYALTY_TIERS[nextTier as keyof typeof LOYALTY_TIERS].min - user.loyalty_points) : 0,
    };
  }

  private getNextTier(current: string): string | null {
    const order = ["BRONZE", "SILVER", "GOLD", "PLATINUM"];
    const idx = order.indexOf(current);
    return idx < order.length - 1 ? order[idx + 1]! : null;
  }

  async recalculateTier(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { loyalty_points: true } });
    if (!user) return;

    let newTier = "BRONZE";
    for (const [tier, config] of Object.entries(LOYALTY_TIERS)) {
      if (user.loyalty_points >= config.min) newTier = tier;
    }

    await prisma.user.update({ where: { id: userId }, data: { loyalty_tier: newTier } });
  }

  async awardPoints(userId: string, points: number, type: string, referenceId: string, descBn: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { loyalty_points: true } });
    if (!user) return;

    const newBalance = user.loyalty_points + points;
    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { loyalty_points: { increment: points } } }),
      prisma.loyaltyTransaction.create({
        data: { user_id: userId, points, type, reference_id: referenceId, description: `Earned: ${type}`, description_bn: descBn, balance_after: newBalance },
      }),
    ]);

    await this.recalculateTier(userId);
  }

  async redeemPoints(userId: string, points: number, orderId: string): Promise<number> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { loyalty_points: true } });
    if (!user || user.loyalty_points < points) throw new Error("Insufficient points");

    const discountAmount = Math.floor(points * 0.8); // 1 point = 0.8 paisa discount (BDT)
    const newBalance = user.loyalty_points - points;

    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { loyalty_points: { decrement: points } } }),
      prisma.loyaltyTransaction.create({
        data: { user_id: userId, points: -points, type: "REDEEMED", reference_id: orderId, description: "Redeemed for order", description_bn: "অর্ডারে রিডিম করা হয়েছে", balance_after: newBalance },
      }),
    ]);

    return discountAmount;
  }
}

// ─────────────────────────────────────────────
// RFM SEGMENTATION
// ─────────────────────────────────────────────

export class RfmService {
  async buildSegments(): Promise<void> {
    logger.info("Building RFM segments...");

    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 86400_000);

    // Champions: bought recently, often, high value
    const champions = await prisma.user.findMany({
      where: {
        orders: {
          some: { created_at: { gte: thirtyDaysAgo }, status: "DELIVERED" },
        },
      },
      select: { id: true, phone: true, email: true },
      take: 1000,
    });

    // At-risk: used to buy, haven't in 90 days
    const atRisk = await prisma.user.findMany({
      where: {
        orders: {
          some: { status: "DELIVERED" },
          none: { created_at: { gte: ninetyDaysAgo } },
        },
      },
      select: { id: true, phone: true, email: true },
      take: 1000,
    });

    await redis.setJson("rfm:champions", champions.map((u) => u.id), 86400);
    await redis.setJson("rfm:at_risk", atRisk.map((u) => u.id), 86400);

    logger.info(`RFM: ${champions.length} champions, ${atRisk.length} at-risk`);
  }
}

// ─────────────────────────────────────────────
// FACEBOOK CONVERSIONS API
// ─────────────────────────────────────────────

export class FacebookConversionsService {
  private async sendEvent(eventName: string, eventData: Record<string, unknown>): Promise<void> {
    const pixelId = process.env["FACEBOOK_PIXEL_ID"];
    const token = process.env["FACEBOOK_CONVERSIONS_API_TOKEN"];
    if (!pixelId || !token) return;

    try {
      await axios.post(
        `https://graph.facebook.com/v18.0/${pixelId}/events`,
        {
          data: [{
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1000),
            action_source: "website",
            ...eventData,
          }],
          test_event_code: process.env["FACEBOOK_TEST_EVENT_CODE"],
        },
        { params: { access_token: token }, timeout: 10000 }
      );
    } catch (err) {
      logger.error("Facebook Conversions API error:", err);
    }
  }

  async trackPurchase(order: { id: string; total_amount: number; user: { email?: string | null; phone?: string | null } }): Promise<void> {
    await this.sendEvent("Purchase", {
      user_data: {
        em: order.user.email ? [this.hash(order.user.email)] : undefined,
        ph: order.user.phone ? [this.hash(order.user.phone)] : undefined,
      },
      custom_data: {
        currency: "BDT",
        value: order.total_amount / 100,
        order_id: order.id,
      },
    });
  }

  async trackAddToCart(productId: string, value: number): Promise<void> {
    await this.sendEvent("AddToCart", {
      custom_data: { currency: "BDT", value: value / 100, content_ids: [productId] },
    });
  }

  private hash(value: string): string {
    const { createHash } = require("crypto") as { createHash: (alg: string) => { update: (s: string) => { digest: (enc: string) => string } } };
    return createHash("sha256").update(value.toLowerCase().trim()).digest("hex");
  }
}

export const abandonedCartService = new AbandonedCartService();
export const loyaltyService = new LoyaltyService();
export const rfmService = new RfmService();
export const fbConversions = new FacebookConversionsService();
