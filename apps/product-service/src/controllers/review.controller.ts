import { Request, Response } from "express";
import { asyncHandler, buildPaginationMeta, parsePagination, HttpError } from "@unkora/utils";
import { prisma } from "@unkora/database";

export class ReviewController {
  getByProduct = asyncHandler(async (req: Request, res: Response) => {
    const { skip, take, page, perPage } = parsePagination(req.query as Record<string, string>);
    const [data, total] = await Promise.all([
      prisma.review.findMany({ where: { product_id: req.params["productId"]!, is_approved: true }, skip, take, orderBy: { created_at: "desc" }, include: { user: { select: { name_en: true, avatar: true } } } }),
      prisma.review.count({ where: { product_id: req.params["productId"]!, is_approved: true } }),
    ]);
    res.json({ success: true, data, meta: buildPaginationMeta(total, page, perPage) });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body as { product_id: string; order_id: string; rating: number; title?: string; body: string; images?: string[] };
    const existing = await prisma.review.findFirst({ where: { product_id: data.product_id, user_id: req.user!.id, order_id: data.order_id } });
    if (existing) throw HttpError.Conflict("Already reviewed this product in this order");
    const review = await prisma.review.create({ data: { ...data, user_id: req.user!.id, is_verified_purchase: true } });
    res.status(201).json({ success: true, data: review });
  });

  markHelpful = asyncHandler(async (req: Request, res: Response) => {
    const review = await prisma.review.update({ where: { id: req.params["id"]! }, data: { helpful_count: { increment: 1 } } });
    res.json({ success: true, data: review });
  });

  approve = asyncHandler(async (req: Request, res: Response) => {
    const review = await prisma.review.update({ where: { id: req.params["id"]! }, data: { is_approved: true } });
    res.json({ success: true, data: review });
  });

  adminReply = asyncHandler(async (req: Request, res: Response) => {
    const { reply } = req.body as { reply: string };
    const review = await prisma.review.update({ where: { id: req.params["id"]! }, data: { admin_reply: reply, admin_reply_at: new Date() } });
    res.json({ success: true, data: review });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    await prisma.review.delete({ where: { id: req.params["id"]! } });
    res.json({ success: true, message: "Review removed" });
  });
}
