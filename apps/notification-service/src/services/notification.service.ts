import nodemailer from "nodemailer";
import axios from "axios";
import { prisma } from "@unkora/database";
import { createLogger, createLogger as log } from "@unkora/utils";

const logger = createLogger("notification-service");

// ─────────────────────────────────────────────
// EMAIL SERVICE
// ─────────────────────────────────────────────

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env["SMTP_HOST"] ?? "smtp.gmail.com",
      port: parseInt(process.env["SMTP_PORT"] ?? "587", 10),
      secure: false,
      auth: {
        user: process.env["SMTP_USER"],
        pass: process.env["SMTP_PASSWORD"],
      },
    });
  }

  async sendOrderConfirmation(to: string, order: {
    order_number: string;
    total_amount: number;
    items: { product_name_bn: string; quantity: number; unit_price: number }[];
    estimated_delivery?: Date;
    recipient_name: string;
  }) {
    const itemsHtml = order.items.map((i) =>
      `<tr><td style="padding:8px">${i.product_name_bn}</td><td style="padding:8px;text-align:center">${i.quantity}</td><td style="padding:8px;text-align:right">৳${(i.unit_price * i.quantity / 100).toLocaleString()}</td></tr>`
    ).join("");

    await this.send({
      to,
      subject: `অর্ডার নিশ্চিত হয়েছে — ${order.order_number}`,
      html: `
        <!DOCTYPE html>
        <html lang="bn">
        <body style="font-family: 'Hind Siliguri', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #FFFBF5;">
          <div style="background: #B45309; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Unkora</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0;">আপনার অর্ডার নিশ্চিত হয়েছে!</p>
          </div>
          <div style="background: white; padding: 24px; border: 1px solid #f0e8d8;">
            <p style="font-size: 16px; color: #333;">প্রিয় ${order.recipient_name},</p>
            <p style="color: #555;">আপনার অর্ডার <strong>${order.order_number}</strong> সফলভাবে গ্রহণ করা হয়েছে। ধন্যবাদ!</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
              <thead><tr style="background:#f9f5ee">
                <th style="padding:8px;text-align:left">পণ্য</th>
                <th style="padding:8px;text-align:center">পরিমাণ</th>
                <th style="padding:8px;text-align:right">মূল্য</th>
              </tr></thead>
              <tbody>${itemsHtml}</tbody>
              <tfoot><tr style="font-weight:bold;border-top:2px solid #f0e8d8">
                <td colspan="2" style="padding:8px">মোট পরিমাণ</td>
                <td style="padding:8px;text-align:right;color:#B45309">৳${(order.total_amount / 100).toLocaleString()}</td>
              </tr></tfoot>
            </table>
            ${order.estimated_delivery ? `<p style="color:#555">আনুমানিক ডেলিভারি: <strong>${order.estimated_delivery.toLocaleDateString("bn-BD")}</strong></p>` : ""}
            <div style="margin-top:24px;padding:16px;background:#f9f5ee;border-radius:8px;text-align:center">
              <a href="https://unkora.com/account/orders/${order.order_number}" style="background:#B45309;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">অর্ডার ট্র্যাক করুন</a>
            </div>
          </div>
          <div style="background:#f9f5ee;padding:16px;border-radius:0 0 12px 12px;text-align:center;font-size:12px;color:#888">
            <p>যোগাযোগ: support@unkora.com | +880 1700-000000</p>
          </div>
        </body>
        </html>
      `,
    });
  }

  async sendOtpEmail(to: string, otp: string) {
    await this.send({
      to,
      subject: "আপনার Unkora ভেরিফিকেশন কোড",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:400px;margin:0 auto;padding:20px;text-align:center">
          <h2 style="color:#B45309">Unkora</h2>
          <p>আপনার ভেরিফিকেশন কোড:</p>
          <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#B45309;padding:20px;background:#f9f5ee;border-radius:8px">${otp}</div>
          <p style="color:#888;font-size:12px;margin-top:16px">এই কোডটি ৫ মিনিটের জন্য বৈধ। কাউকে শেয়ার করবেন না।</p>
        </div>
      `,
    });
  }

  async sendPasswordReset(to: string, resetLink: string) {
    await this.send({
      to,
      subject: "Unkora পাসওয়ার্ড রিসেট",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px">
          <h2 style="color:#B45309">পাসওয়ার্ড রিসেট</h2>
          <p>আপনি পাসওয়ার্ড রিসেটের অনুরোধ করেছেন। নিচের লিংকে ক্লিক করুন:</p>
          <div style="text-align:center;margin:24px 0">
            <a href="${resetLink}" style="background:#B45309;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">পাসওয়ার্ড রিসেট করুন</a>
          </div>
          <p style="color:#888;font-size:12px">এই লিংকটি ১ ঘণ্টা পর মেয়াদ শেষ হবে। আপনি অনুরোধ না করলে এটি উপেক্ষা করুন।</p>
        </div>
      `,
    });
  }

  private async send(options: { to: string; subject: string; html: string }) {
    try {
      await this.transporter.sendMail({
        from: `"Unkora" <${process.env["SMTP_USER"]}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      logger.info(`Email sent to ${options.to}: ${options.subject}`);
    } catch (err) {
      logger.error("Email send failed:", err);
      throw err;
    }
  }
}

// ─────────────────────────────────────────────
// SMS SERVICE
// ─────────────────────────────────────────────

export class SmsService {
  async send(phone: string, message: string): Promise<void> {
    try {
      await this.sendSslWireless(phone, message);
    } catch {
      logger.warn(`SSL Wireless SMS failed for ${phone.slice(0, 8)}***, trying Twilio`);
      await this.sendTwilio(phone, message);
    }
  }

  async sendOrderStatus(phone: string, orderNumber: string, status: string) {
    const messages: Record<string, string> = {
      CONFIRMED: `Unkora: আপনার অর্ডার ${orderNumber} নিশ্চিত হয়েছে। ধন্যবাদ!`,
      PACKED: `Unkora: আপনার অর্ডার ${orderNumber} প্যাক করা হয়েছে।`,
      SHIPPED: `Unkora: আপনার অর্ডার ${orderNumber} কুরিয়ারে পাঠানো হয়েছে।`,
      OUT_FOR_DELIVERY: `Unkora: আপনার অর্ডার ${orderNumber} আজ ডেলিভারি হবে!`,
      DELIVERED: `Unkora: অর্ডার ${orderNumber} সফলভাবে ডেলিভারি হয়েছে। রিভিউ দিন: unkora.com`,
      CANCELLED: `Unkora: আপনার অর্ডার ${orderNumber} বাতিল হয়েছে।`,
    };
    const msg = messages[status] ?? `Unkora: আপনার অর্ডার ${orderNumber} আপডেট: ${status}`;
    await this.send(phone, msg);
  }

  private async sendSslWireless(phone: string, message: string): Promise<void> {
    const token = process.env["SSL_WIRELESS_API_TOKEN"];
    if (!token) throw new Error("SSL Wireless not configured");

    const res = await axios.post(
      "https://sms.sslwireless.com/api/v3/send-sms",
      { senderid: process.env["SSL_WIRELESS_SENDER_ID_TRANSACTIONAL"], csmsid: `UNK_${Date.now()}`, msg: message, to: phone },
      { headers: { token: `Bearer ${token}` }, timeout: 10000 }
    );
    if (res.data?.status !== "ACCEPTED" && res.data?.status !== "200") throw new Error(`SSL Wireless: ${JSON.stringify(res.data)}`);
  }

  private async sendTwilio(phone: string, message: string): Promise<void> {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) throw new Error("Twilio not configured");

    await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      new URLSearchParams({ To: phone, From: TWILIO_PHONE_NUMBER!, Body: message }),
      { auth: { username: TWILIO_ACCOUNT_SID, password: TWILIO_AUTH_TOKEN }, headers: { "Content-Type": "application/x-www-form-urlencoded" }, timeout: 10000 }
    );
  }
}

// ─────────────────────────────────────────────
// PUSH NOTIFICATION
// ─────────────────────────────────────────────

export class PushNotificationService {
  async sendToUser(userId: string, title: string, body: string, data?: Record<string, string>) {
    // Store in DB for in-app notifications
    await prisma.notification.create({
      data: {
        user_id: userId,
        type: "ORDER_STATUS",
        title_en: title,
        title_bn: title,
        body_en: body,
        body_bn: body,
        data: data ?? null,
      },
    });
    logger.info(`Push notification stored for user ${userId}`);
  }
}

// Singletons
export const emailService = new EmailService();
export const smsService = new SmsService();
export const pushService = new PushNotificationService();
