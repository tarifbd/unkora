import axios from "axios";
import crypto from "crypto";
import { prisma } from "@unkora/database";
import { redis, REDIS_KEYS } from "@unkora/database";
import { generateToken, generateIdempotencyKey, HttpError, createLogger } from "@unkora/utils";

const logger = createLogger("payment-service");

// ─────────────────────────────────────────────
// SSLCOMMERZ
// ─────────────────────────────────────────────

export class SSLCommerzService {
  private baseUrl: string;
  private storeId: string;
  private storePassword: string;

  constructor() {
    this.storeId = process.env["SSLCOMMERZ_STORE_ID"] ?? "";
    this.storePassword = process.env["SSLCOMMERZ_STORE_PASSWORD"] ?? "";
    const isLive = process.env["SSLCOMMERZ_IS_LIVE"] === "true";
    this.baseUrl = isLive
      ? "https://securepay.sslcommerz.com"
      : "https://sandbox.sslcommerz.com";
  }

  async initiate(order: {
    id: string;
    order_number: string;
    total_amount: number;
    user: { name_en: string; email?: string | null; phone?: string | null };
    shipping_address: Record<string, string>;
  }, transactionId: string): Promise<string> {
    const successUrl = `${process.env["SSLCOMMERZ_SUCCESS_URL"]}?tran_id=${transactionId}`;
    const failUrl = process.env["SSLCOMMERZ_FAIL_URL"] ?? "";
    const cancelUrl = process.env["SSLCOMMERZ_CANCEL_URL"] ?? "";

    const payload = {
      store_id: this.storeId,
      store_passwd: this.storePassword,
      total_amount: (order.total_amount / 100).toFixed(2),
      currency: "BDT",
      tran_id: transactionId,
      success_url: successUrl,
      fail_url: failUrl,
      cancel_url: cancelUrl,
      ipn_url: process.env["SSLCOMMERZ_IPN_URL"],
      cus_name: order.user.name_en,
      cus_email: order.user.email ?? `${transactionId}@unkora.com`,
      cus_phone: order.user.phone ?? "01700000000",
      cus_add1: (order.shipping_address["street"] as string) ?? "",
      cus_city: (order.shipping_address["district"] as string) ?? "",
      cus_country: "Bangladesh",
      shipping_method: "Courier",
      product_name: `Unkora Order ${order.order_number}`,
      product_category: "General",
      product_profile: "general",
    };

    const res = await axios.post(`${this.baseUrl}/gwprocess/v4/api.php`, payload, { timeout: 15000 });

    if (res.data?.status !== "SUCCESS") {
      logger.error("SSLCommerz init failed:", res.data);
      throw HttpError.InternalError("Payment gateway error", "GATEWAY_ERROR", "পেমেন্ট গেটওয়েতে সমস্যা");
    }

    return res.data.GatewayPageURL as string;
  }

  async verifyIpn(ipnData: Record<string, string>): Promise<boolean> {
    const { val_id, store_passwd, status } = ipnData;
    if (status !== "VALID" && status !== "VALIDATED") return false;

    try {
      const res = await axios.get(
        `${this.baseUrl}/validator/api/validationserverAPI.php`,
        { params: { val_id, store_passwd: store_passwd ?? this.storePassword }, timeout: 10000 }
      );
      return res.data?.status === "VALID" || res.data?.status === "VALIDATED";
    } catch {
      return false;
    }
  }
}

// ─────────────────────────────────────────────
// BKASH
// ─────────────────────────────────────────────

export class BkashService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env["BKASH_BASE_URL"] ?? "https://tokenized.sandbox.bka.sh/v1.2.0-beta";
  }

  private async getToken(): Promise<string> {
    const cached = await redis.get(REDIS_KEYS.bkashToken());
    if (cached) return cached;

    const res = await axios.post(
      `${this.baseUrl}/tokenized/checkout/token/grant`,
      {
        app_key: process.env["BKASH_APP_KEY"],
        app_secret: process.env["BKASH_APP_SECRET"],
      },
      {
        headers: {
          username: process.env["BKASH_USERNAME"],
          password: process.env["BKASH_PASSWORD"],
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    const token = res.data?.id_token as string;
    const expiresIn = parseInt(res.data?.expires_in ?? "3600", 10) - 60;
    await redis.setex(REDIS_KEYS.bkashToken(), expiresIn, token);
    return token;
  }

  async createPayment(amount: number, orderId: string, orderNumber: string): Promise<{ bkashURL: string; paymentID: string }> {
    const token = await this.getToken();
    const res = await axios.post(
      `${this.baseUrl}/tokenized/checkout/create`,
      {
        mode: "0011",
        payerReference: orderId,
        callbackURL: `${process.env["NEXTAUTH_URL"]}/checkout/bkash/callback`,
        amount: (amount / 100).toFixed(2),
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: orderNumber,
      },
      {
        headers: {
          Authorization: token,
          "X-APP-Key": process.env["BKASH_APP_KEY"],
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    if (res.data?.statusCode !== "0000") {
      logger.error("bKash create payment failed:", res.data);
      throw HttpError.InternalError("bKash payment failed", "BKASH_ERROR", "bKash পেমেন্টে সমস্যা");
    }

    return { bkashURL: res.data.bkashURL as string, paymentID: res.data.paymentID as string };
  }

  async executePayment(paymentId: string): Promise<Record<string, unknown>> {
    const token = await this.getToken();
    const res = await axios.post(
      `${this.baseUrl}/tokenized/checkout/execute`,
      { paymentID: paymentId },
      {
        headers: { Authorization: token, "X-APP-Key": process.env["BKASH_APP_KEY"], "Content-Type": "application/json" },
        timeout: 15000,
      }
    );

    if (res.data?.statusCode !== "0000") {
      throw HttpError.BadRequest("bKash payment execution failed", "BKASH_EXECUTE_FAILED", "bKash পেমেন্ট সম্পন্ন হয়নি");
    }

    return res.data as Record<string, unknown>;
  }

  async refund(transactionId: string, paymentId: string, amount: number, reason: string): Promise<void> {
    const token = await this.getToken();
    await axios.post(
      `${this.baseUrl}/tokenized/checkout/payment/refund`,
      {
        paymentID: paymentId,
        trxID: transactionId,
        amount: (amount / 100).toFixed(2),
        currency: "BDT",
        reason,
      },
      {
        headers: { Authorization: token, "X-APP-Key": process.env["BKASH_APP_KEY"], "Content-Type": "application/json" },
        timeout: 15000,
      }
    );
  }
}

// ─────────────────────────────────────────────
// NAGAD
// ─────────────────────────────────────────────

export class NagadService {
  private baseUrl: string;
  private merchantId: string;

  constructor() {
    this.baseUrl = process.env["NAGAD_BASE_URL"] ?? "https://api.mynagad.com/api/dfs";
    this.merchantId = process.env["NAGAD_MERCHANT_ID"] ?? "";
  }

  private sign(data: string): string {
    const privateKey = process.env["NAGAD_MERCHANT_PRIVATE_KEY"]?.replace(/\\n/g, "\n") ?? "";
    return crypto.createSign("SHA256").update(data).sign(privateKey, "base64");
  }

  private encrypt(data: string): string {
    const publicKey = process.env["NAGAD_MERCHANT_PUBLIC_KEY"]?.replace(/\\n/g, "\n") ?? "";
    return crypto.publicEncrypt({ key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(data)).toString("base64");
  }

  async initiatePayment(orderId: string, orderNumber: string, amount: number): Promise<string> {
    const datetime = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
    const sensitiveData = JSON.stringify({
      merchantId: this.merchantId,
      datetime,
      orderId,
      challenge: generateToken(16),
    });

    const res = await axios.post(
      `${this.baseUrl}/check-out/initialize/${this.merchantId}/${orderId}`,
      {
        dateTime: datetime,
        sensitiveData: this.encrypt(sensitiveData),
        signature: this.sign(sensitiveData),
      },
      { headers: { "X-KM-IP-V4": "127.0.0.1", "X-KM-MC-Id": this.merchantId, "X-KM-Client-Type": "PC", "Content-Type": "application/json" }, timeout: 15000 }
    );

    const callbackUrl = `${process.env["NEXTAUTH_URL"]}/checkout/nagad/callback`;
    const completeRes = await axios.post(
      `${this.baseUrl}/check-out/complete/${res.data.paymentReferenceId as string}`,
      {
        sensitiveData: this.encrypt(JSON.stringify({
          merchantId: this.merchantId,
          orderId,
          currencyCode: "050",
          amount: (amount / 100).toFixed(2),
          challenge: res.data.challenge as string,
        })),
        signature: this.sign(sensitiveData),
        merchantCallbackURL: callbackUrl,
      },
      { headers: { "X-KM-IP-V4": "127.0.0.1", "X-KM-MC-Id": this.merchantId, "X-KM-Client-Type": "PC", "Content-Type": "application/json" }, timeout: 15000 }
    );

    return completeRes.data.callBackUrl as string;
  }
}

// ─────────────────────────────────────────────
// PAYMENT ORCHESTRATOR
// ─────────────────────────────────────────────

export class PaymentService {
  private ssl = new SSLCommerzService();
  private bkash = new BkashService();
  private nagad = new NagadService();

  async initiatePayment(orderId: string, userId: string, gateway: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId, user_id: userId },
      include: { user: { select: { name_en: true, email: true, phone: true } } },
    });
    if (!order) throw HttpError.NotFound("Order not found", "ORDER_NOT_FOUND");
    if (order.payment_status === "PAID") throw HttpError.Conflict("Already paid", "ALREADY_PAID", "ইতিমধ্যে পেমেন্ট হয়েছে");

    const transactionId = `UNK-PAY-${generateToken(8).toUpperCase()}`;
    const idempotencyKey = generateIdempotencyKey();

    await prisma.payment.upsert({
      where: { order_id: orderId },
      create: {
        order_id: orderId,
        transaction_id: transactionId,
        gateway: gateway as Parameters<typeof prisma.payment.create>[0]["data"]["gateway"],
        amount: order.total_amount,
        idempotency_key: idempotencyKey,
      },
      update: { transaction_id: transactionId, gateway: gateway as Parameters<typeof prisma.payment.update>[0]["data"]["gateway"] },
    });

    let paymentUrl: string | null = null;
    let bkashPaymentId: string | null = null;

    if (gateway === "SSLCOMMERZ") {
      paymentUrl = await this.ssl.initiate(
        { ...order, user: order.user ?? { name_en: "User", email: null, phone: null }, shipping_address: order.shipping_address as Record<string, string> },
        transactionId
      );
    } else if (gateway === "BKASH") {
      const { bkashURL, paymentID } = await this.bkash.createPayment(order.total_amount, orderId, order.order_number);
      paymentUrl = bkashURL;
      bkashPaymentId = paymentID;
      await redis.setex(`bkash_payment:${paymentID}`, 3600, orderId);
    } else if (gateway === "NAGAD") {
      paymentUrl = await this.nagad.initiatePayment(orderId, order.order_number, order.total_amount);
    } else if (gateway === "COD") {
      await this.confirmPayment(orderId, transactionId, "COD");
    }

    return { transaction_id: transactionId, payment_url: paymentUrl, bkash_payment_id: bkashPaymentId };
  }

  async confirmPayment(orderId: string, transactionId: string, gateway: string, gatewayResponse?: Record<string, unknown>) {
    await prisma.$transaction([
      prisma.payment.update({
        where: { order_id: orderId },
        data: {
          status: "PAID",
          gateway_transaction_id: (gatewayResponse?.["bank_tran_id"] as string) ?? transactionId,
          gateway_response: gatewayResponse,
        },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: { status: "CONFIRMED", payment_status: "PAID" },
      }),
      prisma.orderStatusHistory.create({
        data: { order_id: orderId, status: "CONFIRMED", note: `Payment confirmed via ${gateway}` },
      }),
    ]);

    // Award loyalty points (1 point per ৳10 = per 1000 paisa)
    const order = await prisma.order.findUnique({ where: { id: orderId }, select: { user_id: true, total_amount: true } });
    if (order) {
      const points = Math.floor(order.total_amount / 1000);
      if (points > 0) {
        const user = await prisma.user.findUnique({ where: { id: order.user_id }, select: { loyalty_points: true } });
        const newBalance = (user?.loyalty_points ?? 0) + points;
        await prisma.$transaction([
          prisma.user.update({ where: { id: order.user_id }, data: { loyalty_points: { increment: points } } }),
          prisma.loyaltyTransaction.create({
            data: {
              user_id: order.user_id,
              points,
              type: "EARNED_PURCHASE",
              reference_id: orderId,
              description: `Earned from order`,
              description_bn: `অর্ডার থেকে অর্জিত`,
              balance_after: newBalance,
            },
          }),
        ]);
      }
    }

    logger.info(`Payment confirmed for order ${orderId}`);
  }

  async processRefund(orderId: string, amount: number, reason: string) {
    const payment = await prisma.payment.findUnique({ where: { order_id: orderId } });
    if (!payment) throw HttpError.NotFound("Payment not found");
    if (payment.status !== "PAID") throw HttpError.BadRequest("Payment not in paid state");

    if (payment.gateway === "BKASH" && payment.gateway_transaction_id) {
      await this.bkash.refund(payment.gateway_transaction_id, payment.transaction_id, amount, reason);
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "REFUNDED", refund_amount: amount, refund_reason: reason, refunded_at: new Date() },
    });
  }
}

export const paymentService = new PaymentService();
