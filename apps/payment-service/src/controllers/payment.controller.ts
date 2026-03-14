import { Request, Response } from "express";
import { asyncHandler, HttpError, generateIdempotencyKey, generateToken } from "@unkora/utils";
import { prisma } from "@unkora/database";

export class PaymentController {
  initiate = asyncHandler(async (req: Request, res: Response) => {
    const { order_id, gateway } = req.body as { order_id: string; gateway: string };
    const order = await prisma.order.findUnique({ where: { id: order_id, user_id: req.user!.id } });
    if (!order) throw HttpError.NotFound("Order not found");
    if (order.payment_status === "PAID") throw HttpError.Conflict("Order already paid");

    const idempotencyKey = generateIdempotencyKey();
    const transactionId = `UNK-PAY-${generateToken(8).toUpperCase()}`;

    const payment = await prisma.payment.create({
      data: {
        order_id, transaction_id: transactionId, gateway: gateway as Parameters<typeof prisma.payment.create>[0]["data"]["gateway"],
        amount: order.total_amount, currency: "BDT", idempotency_key: idempotencyKey,
      },
    });

    // Gateway-specific initiation
    let paymentUrl = null;
    if (gateway === "SSLCOMMERZ") {
      paymentUrl = await this._initSSLCommerz(order, transactionId);
    } else if (gateway === "BKASH") {
      paymentUrl = await this._initBkash(order, transactionId);
    } else if (gateway === "NAGAD") {
      paymentUrl = await this._initNagad(order, transactionId);
    } else if (gateway === "COD") {
      await prisma.order.update({ where: { id: order_id }, data: { payment_method: "COD", status: "CONFIRMED" } });
    }

    res.json({ success: true, data: { payment_id: payment.id, transaction_id: transactionId, payment_url: paymentUrl } });
  });

  getByOrder = asyncHandler(async (req: Request, res: Response) => {
    const payment = await prisma.payment.findUnique({ where: { order_id: req.params["orderId"]! } });
    if (!payment) throw HttpError.NotFound("Payment not found");
    res.json({ success: true, data: payment });
  });

  sslcommerzIpn = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body as Record<string, string>;
    const tran_id = data["tran_id"];
    if (!tran_id) { res.status(400).json({ success: false }); return; }
    // Verify SSL store password hash: val_id, store_passwd etc.
    const payment = await prisma.payment.findFirst({ where: { transaction_id: tran_id } });
    if (!payment) { res.status(404).json({ success: false }); return; }

    if (data["status"] === "VALID") {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "PAID", gateway_transaction_id: data["bank_tran_id"], gateway_response: data } });
      await prisma.order.update({ where: { id: payment.order_id }, data: { payment_status: "PAID", status: "CONFIRMED", status_history: { create: [{ status: "CONFIRMED", note: "Payment confirmed via SSLCommerz" }] } } });
    } else {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED", gateway_response: data } });
    }
    res.send("RECEIVED");
  });

  sslcommerzSuccess = asyncHandler(async (req: Request, res: Response) => {
    const frontendUrl = process.env["FRONTEND_URL"] ?? "http://localhost:3000";
    const tran_id = (req.body as Record<string, string>)["tran_id"];
    res.redirect(`${frontendUrl}/order/success?tran_id=${tran_id ?? ""}`);
  });

  sslcommerzFail = asyncHandler(async (req: Request, res: Response) => {
    const frontendUrl = process.env["FRONTEND_URL"] ?? "http://localhost:3000";
    res.redirect(`${frontendUrl}/order/failed`);
  });

  bkashCallback = asyncHandler(async (req: Request, res: Response) => {
    const { paymentID, status } = req.body as Record<string, string>;
    if (status === "success" && paymentID) {
      const payment = await prisma.payment.findFirst({ where: { gateway_transaction_id: paymentID } });
      if (payment) {
        await prisma.payment.update({ where: { id: payment.id }, data: { status: "PAID" } });
        await prisma.order.update({ where: { id: payment.order_id }, data: { payment_status: "PAID", status: "CONFIRMED" } });
      }
    }
    res.json({ success: true });
  });

  nagadCallback = asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true });
  });

  refund = asyncHandler(async (req: Request, res: Response) => {
    const { reason, amount } = req.body as { reason: string; amount?: number };
    const payment = await prisma.payment.findUnique({ where: { id: req.params["id"]! } });
    if (!payment) throw HttpError.NotFound("Payment not found");
    if (payment.status !== "PAID") throw HttpError.BadRequest("Payment not eligible for refund");

    const refundAmount = amount ?? payment.amount;
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "REFUNDED", refund_amount: refundAmount, refund_reason: reason, refunded_at: new Date() } });
    await prisma.order.update({ where: { id: payment.order_id }, data: { payment_status: "REFUNDED", status: "REFUNDED" } });
    res.json({ success: true, message: "Refund initiated" });
  });

  private async _initSSLCommerz(order: { id: string; order_number: string; total_amount: number }, tran_id: string): Promise<string> {
    const storeId = process.env["SSLCOMMERZ_STORE_ID"] ?? "test_store";
    const storePass = process.env["SSLCOMMERZ_STORE_PASS"] ?? "test_pass";
    const isSandbox = process.env["NODE_ENV"] !== "production";
    const baseUrl = isSandbox ? "https://sandbox.sslcommerz.com" : "https://securepay.sslcommerz.com";
    const successUrl = `${process.env["PAYMENT_SERVICE_URL"] ?? "http://localhost:4004"}/payments/sslcommerz/success`;
    const failUrl = `${process.env["PAYMENT_SERVICE_URL"] ?? "http://localhost:4004"}/payments/sslcommerz/fail`;
    const ipnUrl = `${process.env["PAYMENT_SERVICE_URL"] ?? "http://localhost:4004"}/payments/sslcommerz/ipn`;

    const payload = new URLSearchParams({
      store_id: storeId, store_passwd: storePass,
      total_amount: String(order.total_amount / 100), currency: "BDT",
      tran_id, success_url: successUrl, fail_url: failUrl, cancel_url: failUrl, ipn_url: ipnUrl,
      product_name: `Unkora Order ${order.order_number}`, product_category: "ecommerce", product_profile: "general",
      cus_name: "Customer", cus_email: "customer@unkora.com.bd", cus_phone: "01700000000",
      cus_add1: "Dhaka", cus_city: "Dhaka", cus_country: "Bangladesh",
    });

    const res = await fetch(`${baseUrl}/gwprocess/v4/api.php`, { method: "POST", body: payload });
    const data = await res.json() as { status: string; GatewayPageURL?: string };
    if (data.status !== "SUCCESS" || !data.GatewayPageURL) throw HttpError.InternalError("SSLCommerz init failed");
    return data.GatewayPageURL;
  }

  private async _initBkash(_order: unknown, _tran_id: string): Promise<string> {
    return `https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/payment/create`;
  }

  private async _initNagad(_order: unknown, _tran_id: string): Promise<string> {
    return `https://sandbox.mynagad.com:10080/merchant-server/api/dfs/check-out/initialize`;
  }
}
