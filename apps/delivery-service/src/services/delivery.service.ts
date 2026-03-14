import axios from "axios";
import { prisma } from "@unkora/database";
import { redis } from "@unkora/database";
import { createLogger, HttpError, generateToken } from "@unkora/utils";

const logger = createLogger("delivery-service");

// ─────────────────────────────────────────────
// COURIER ADAPTER INTERFACE
// ─────────────────────────────────────────────

export interface ICourierAdapter {
  name: string;
  createParcel(order: ParcelOrder): Promise<{ consignment_id: string; tracking_url: string }>;
  trackParcel(consignmentId: string): Promise<TrackingInfo>;
  cancelParcel(consignmentId: string): Promise<void>;
}

export interface ParcelOrder {
  order_id: string;
  order_number: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_district: string;
  weight_grams: number;
  cod_amount: number;
  special_instruction?: string;
  item_count: number;
}

export interface TrackingInfo {
  status: string;
  location?: string;
  events: { timestamp: Date; status: string; location?: string; note?: string }[];
}

// ─────────────────────────────────────────────
// PATHAO ADAPTER
// ─────────────────────────────────────────────

export class PathaoAdapter implements ICourierAdapter {
  name = "PATHAO";
  private token: string | null = null;

  private async getToken(): Promise<string> {
    if (this.token) return this.token;
    const cached = await redis.get("pathao:token");
    if (cached) { this.token = cached; return cached; }

    const res = await axios.post(`${process.env["PATHAO_BASE_URL"]}/aladdin/api/v1/issue-token`, {
      client_id: process.env["PATHAO_CLIENT_ID"],
      client_secret: process.env["PATHAO_CLIENT_SECRET"],
      username: process.env["PATHAO_USERNAME"],
      password: process.env["PATHAO_PASSWORD"],
      grant_type: "password",
    }, { timeout: 10000 });

    const token = res.data?.access_token as string;
    await redis.setex("pathao:token", 3600 * 24, token);
    this.token = token;
    return token;
  }

  async createParcel(order: ParcelOrder): Promise<{ consignment_id: string; tracking_url: string }> {
    const token = await this.getToken();
    const res = await axios.post(
      `${process.env["PATHAO_BASE_URL"]}/aladdin/api/v1/orders`,
      {
        store_id: process.env["PATHAO_STORE_ID"],
        merchant_order_id: order.order_number,
        recipient_name: order.recipient_name,
        recipient_phone: order.recipient_phone,
        recipient_address: order.recipient_address,
        recipient_city: 1, // Dhaka
        delivery_type: 48,
        item_type: 2,
        special_instruction: order.special_instruction ?? "",
        item_quantity: order.item_count,
        item_weight: order.weight_grams / 1000,
        amount_to_collect: order.cod_amount / 100,
      },
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, timeout: 15000 }
    );

    const consignmentId = res.data?.data?.consignment_id as string;
    return {
      consignment_id: consignmentId,
      tracking_url: `https://pathao.com/bd/track/${consignmentId}`,
    };
  }

  async trackParcel(consignmentId: string): Promise<TrackingInfo> {
    const token = await this.getToken();
    const res = await axios.get(
      `${process.env["PATHAO_BASE_URL"]}/aladdin/api/v1/orders/${consignmentId}/info`,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );
    return {
      status: res.data?.data?.order_status as string ?? "unknown",
      events: [],
    };
  }

  async cancelParcel(consignmentId: string): Promise<void> {
    const token = await this.getToken();
    await axios.post(
      `${process.env["PATHAO_BASE_URL"]}/aladdin/api/v1/orders/cancel`,
      { consignment_id: consignmentId },
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );
  }
}

// ─────────────────────────────────────────────
// STEADFAST ADAPTER
// ─────────────────────────────────────────────

export class SteadfastAdapter implements ICourierAdapter {
  name = "STEADFAST";

  async createParcel(order: ParcelOrder): Promise<{ consignment_id: string; tracking_url: string }> {
    const res = await axios.post(
      `${process.env["STEADFAST_BASE_URL"]}/api/v1/create_order`,
      {
        invoice: order.order_number,
        recipient_name: order.recipient_name,
        recipient_phone: order.recipient_phone,
        recipient_address: order.recipient_address,
        cod_amount: order.cod_amount / 100,
        note: order.special_instruction ?? "",
      },
      {
        headers: {
          "Api-Key": process.env["STEADFAST_API_KEY"],
          "Secret-Key": process.env["STEADFAST_API_SECRET"],
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const consignment = res.data?.consignment as { tracking_code: string };
    return {
      consignment_id: consignment.tracking_code,
      tracking_url: `https://portal.steadfast.com.bd/order-tracking?trackingCode=${consignment.tracking_code}`,
    };
  }

  async trackParcel(consignmentId: string): Promise<TrackingInfo> {
    const res = await axios.get(
      `${process.env["STEADFAST_BASE_URL"]}/api/v1/status_by_trackingcode/${consignmentId}`,
      {
        headers: { "Api-Key": process.env["STEADFAST_API_KEY"], "Secret-Key": process.env["STEADFAST_API_SECRET"] },
        timeout: 10000,
      }
    );
    return { status: res.data?.delivery_status as string ?? "unknown", events: [] };
  }

  async cancelParcel(_consignmentId: string): Promise<void> {
    // Steadfast doesn't support API cancellation
    logger.warn("Steadfast cancellation must be done manually");
  }
}

// ─────────────────────────────────────────────
// REDX ADAPTER
// ─────────────────────────────────────────────

export class RedXAdapter implements ICourierAdapter {
  name = "REDX";

  async createParcel(order: ParcelOrder): Promise<{ consignment_id: string; tracking_url: string }> {
    const res = await axios.post(
      `${process.env["REDX_BASE_URL"]}/api/v1.0.0/parcel`,
      {
        name: order.recipient_name,
        number: order.recipient_phone,
        address: order.recipient_address,
        area_id: 1,
        invoice_id: order.order_number,
        cash_collection_amount: order.cod_amount / 100,
        weight: order.weight_grams,
        instruction: order.special_instruction ?? "",
      },
      {
        headers: { "API-ACCESS-TOKEN": `Bearer ${process.env["REDX_API_KEY"]}`, "Content-Type": "application/json" },
        timeout: 15000,
      }
    );

    const trackingId = res.data?.tracking_id as string;
    return {
      consignment_id: trackingId,
      tracking_url: `https://redx.com.bd/track-parcel/?trackingId=${trackingId}`,
    };
  }

  async trackParcel(consignmentId: string): Promise<TrackingInfo> {
    const res = await axios.get(
      `${process.env["REDX_BASE_URL"]}/api/v1.0.0/parcel/track/${consignmentId}`,
      { headers: { "API-ACCESS-TOKEN": `Bearer ${process.env["REDX_API_KEY"]}` }, timeout: 10000 }
    );
    return { status: res.data?.parcel?.status as string ?? "unknown", events: [] };
  }

  async cancelParcel(consignmentId: string): Promise<void> {
    await axios.post(
      `${process.env["REDX_BASE_URL"]}/api/v1.0.0/parcel/cancel/${consignmentId}`,
      {},
      { headers: { "API-ACCESS-TOKEN": `Bearer ${process.env["REDX_API_KEY"]}` }, timeout: 10000 }
    );
  }
}

// ─────────────────────────────────────────────
// FRAUD DETECTION
// ─────────────────────────────────────────────

export interface FraudScore {
  score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  flags: { type: string; points: number; description: string }[];
  recommendation: "APPROVE" | "REVIEW" | "REQUIRE_PREPAYMENT" | "REJECT";
}

export class FraudDetectionService {
  async scoreOrder(orderId: string): Promise<FraudScore> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: { select: { created_at: true, phone: true, email: true } }, items: true },
    });
    if (!order) throw HttpError.NotFound("Order not found");

    let score = 0;
    const flags: FraudScore["flags"] = [];

    // New account risk
    const accountAgeDays = order.user
      ? Math.floor((Date.now() - new Date(order.user.created_at).getTime()) / 86400000)
      : 0;
    if (accountAgeDays < 7) {
      score += 20;
      flags.push({ type: "NEW_ACCOUNT", points: 20, description: "Account less than 7 days old" });
    }

    // COD high value
    if (order.payment_method === "COD" && order.total_amount > 500000) {
      score += 15;
      flags.push({ type: "HIGH_VALUE_COD", points: 15, description: "COD order over ৳5,000" });
    }

    // Phone blacklist
    const phone = order.user?.phone;
    if (phone) {
      const blacklisted = await prisma.blacklist.findFirst({
        where: { type: "PHONE", value: phone, is_active: true },
      });
      if (blacklisted) {
        score += 100;
        flags.push({ type: "BLACKLISTED_PHONE", points: 100, description: "Phone in blacklist" });
      }
    }

    // Failed COD history
    const failedOrders = await prisma.order.count({
      where: {
        user_id: order.user_id,
        payment_method: "COD",
        status: { in: ["CANCELLED", "RETURN_REQUESTED"] },
      },
    });
    if (failedOrders > 0) {
      const pts = Math.min(failedOrders * 25, 75);
      score += pts;
      flags.push({ type: "FAILED_COD_HISTORY", points: pts, description: `${failedOrders} previous COD failures` });
    }

    // Excessive quantity
    const maxQty = Math.max(...order.items.map((i) => i.quantity));
    if (maxQty > 10) {
      score += 10;
      flags.push({ type: "BULK_ORDER", points: 10, description: `High quantity: ${maxQty} units` });
    }

    let risk_level: FraudScore["risk_level"];
    let recommendation: FraudScore["recommendation"];

    if (score < 30) { risk_level = "LOW"; recommendation = "APPROVE"; }
    else if (score < 60) { risk_level = "MEDIUM"; recommendation = "REVIEW"; }
    else if (score < 80) { risk_level = "HIGH"; recommendation = "REQUIRE_PREPAYMENT"; }
    else { risk_level = "CRITICAL"; recommendation = "REJECT"; }

    await prisma.order.update({ where: { id: orderId }, data: { fraud_score: score } });
    return { score, risk_level, flags, recommendation };
  }
}

// ─────────────────────────────────────────────
// DELIVERY ORCHESTRATOR
// ─────────────────────────────────────────────

export class DeliveryService {
  private couriers: Map<string, ICourierAdapter> = new Map([
    ["PATHAO", new PathaoAdapter()],
    ["STEADFAST", new SteadfastAdapter()],
    ["REDX", new RedXAdapter()],
  ]);

  private fraud = new FraudDetectionService();

  private selectCourier(district: string): ICourierAdapter {
    // Dhaka Metro → Pathao; everywhere else → Steadfast → RedX
    const dhakaMetro = ["dhaka", "gazipur", "narayanganj", "narsingdi"];
    const isMetro = dhakaMetro.some((d) => district.toLowerCase().includes(d));
    if (isMetro && this.couriers.get("PATHAO")) return this.couriers.get("PATHAO")!;
    if (this.couriers.get("STEADFAST")) return this.couriers.get("STEADFAST")!;
    return this.couriers.get("REDX")!;
  }

  async assignCourier(orderId: string): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: { select: { weight_grams: true } } } } },
    });
    if (!order) throw HttpError.NotFound("Order not found");

    const shippingAddress = order.shipping_address as Record<string, string>;
    const district = shippingAddress["district"] ?? "Dhaka";

    const courier = this.selectCourier(district);
    const totalWeight = order.items.reduce((sum, item) => sum + (item.product?.weight_grams ?? 500) * item.quantity, 0);

    const parcelOrder: ParcelOrder = {
      order_id: orderId,
      order_number: order.order_number,
      recipient_name: shippingAddress["recipient_name"] ?? "",
      recipient_phone: shippingAddress["phone"] ?? "",
      recipient_address: `${shippingAddress["street"]}, ${shippingAddress["upazila"]}, ${district}`,
      recipient_district: district,
      weight_grams: totalWeight,
      cod_amount: order.payment_method === "COD" ? order.total_amount : 0,
      item_count: order.items.reduce((s, i) => s + i.quantity, 0),
    };

    const { consignment_id, tracking_url } = await courier.createParcel(parcelOrder);

    await prisma.$transaction([
      prisma.delivery.create({
        data: {
          order_id: orderId,
          courier: courier.name as Parameters<typeof prisma.delivery.create>[0]["data"]["courier"],
          consignment_id,
          tracking_url,
          status: "PENDING_PICKUP",
        },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: { courier: courier.name as Parameters<typeof prisma.order.update>[0]["data"]["courier"], tracking_number: consignment_id, status: "HANDED_TO_COURIER" },
      }),
      prisma.orderStatusHistory.create({
        data: { order_id: orderId, status: "HANDED_TO_COURIER", note: `Assigned to ${courier.name}, tracking: ${consignment_id}` },
      }),
    ]);

    logger.info(`Order ${orderId} assigned to ${courier.name}: ${consignment_id}`);
  }

  async trackOrder(orderId: string) {
    const delivery = await prisma.delivery.findUnique({
      where: { order_id: orderId },
      include: { tracking_events: { orderBy: { timestamp: "asc" } } },
    });
    if (!delivery?.consignment_id) throw HttpError.NotFound("No delivery found");

    // Redis cache for 5 min
    const cacheKey = `track:${delivery.consignment_id}`;
    const cached = await redis.getJson(cacheKey);
    if (cached) return cached;

    const courier = this.couriers.get(delivery.courier);
    if (!courier) throw HttpError.BadRequest("Unknown courier");

    const info = await courier.trackParcel(delivery.consignment_id);
    await redis.setJson(cacheKey, { ...info, consignment_id: delivery.consignment_id, tracking_url: delivery.tracking_url }, 300);

    return info;
  }

  async scoreOrderFraud(orderId: string): Promise<FraudScore> {
    return this.fraud.scoreOrder(orderId);
  }

  async estimateDelivery(district: string, deliveryMethod: "STANDARD" | "EXPRESS" = "STANDARD") {
    const zone = await prisma.deliveryZone.findFirst({
      where: { district: { contains: district, mode: "insensitive" }, is_serviceable: true },
    });

    if (!zone) {
      return {
        is_serviceable: false,
        standard_days: null,
        express_days: null,
        standard_cost: null,
        express_cost: null,
        cod_available: false,
      };
    }

    const { addBusinessDays } = await import("@unkora/utils");
    const now = new Date();

    return {
      is_serviceable: true,
      standard_days: zone.standard_days,
      express_days: zone.express_days,
      standard_cost: zone.standard_cost,
      express_cost: zone.express_cost,
      cod_available: zone.cod_available,
      estimated_standard: addBusinessDays(now, zone.standard_days),
      estimated_express: addBusinessDays(now, zone.express_days),
    };
  }
}

export const deliveryService = new DeliveryService();
