import { Router } from "express";
import { asyncHandler, HttpError } from "@unkora/utils";
import { prisma } from "@unkora/database";
import { emailService, smsService, pushService } from "../services/notification.service";
import type { Request, Response } from "express";

export const notificationRouter = Router();

// Get user notifications
notificationRouter.get("/", asyncHandler(async (req: Request, res: Response) => {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) throw HttpError.Unauthorized();
  const notifications = await prisma.notification.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
    take: 50,
  });
  res.json({ success: true, data: notifications });
}));

// Mark as read
notificationRouter.patch("/:id/read", asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await prisma.notification.update({ where: { id }, data: { is_read: true, read_at: new Date() } });
  res.json({ success: true });
}));

// Mark all as read
notificationRouter.post("/mark-all-read", asyncHandler(async (req: Request, res: Response) => {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) throw HttpError.Unauthorized();
  await prisma.notification.updateMany({ where: { user_id: userId, is_read: false }, data: { is_read: true, read_at: new Date() } });
  res.json({ success: true });
}));

// Send order status update (internal)
notificationRouter.post("/order-status", asyncHandler(async (req: Request, res: Response) => {
  const secret = req.headers["x-internal-secret"];
  if (secret !== process.env["INTERNAL_API_SECRET"]) throw HttpError.Forbidden();

  const { order_id, status, phone, email, user_id } = req.body as {
    order_id: string; status: string; phone?: string; email?: string; user_id: string;
  };

  const orderNum = (await prisma.order.findUnique({ where: { id: order_id }, select: { order_number: true } }))?.order_number ?? order_id;

  const tasks: Promise<void>[] = [
    pushService.sendToUser(user_id, `অর্ডার আপডেট: ${status}`, `আপনার অর্ডার ${orderNum} - ${status}`, { order_id }),
  ];

  if (phone) tasks.push(smsService.sendOrderStatus(phone, orderNum, status));

  await Promise.allSettled(tasks);
  res.json({ success: true });
}));

// Send email (internal)
notificationRouter.post("/email/order-confirmation", asyncHandler(async (req: Request, res: Response) => {
  const secret = req.headers["x-internal-secret"];
  if (secret !== process.env["INTERNAL_API_SECRET"]) throw HttpError.Forbidden();

  const { to, order } = req.body as { to: string; order: Parameters<typeof emailService.sendOrderConfirmation>[1] };
  await emailService.sendOrderConfirmation(to, order);
  res.json({ success: true });
}));
