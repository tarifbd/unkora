import { Request, Response } from "express";
import { asyncHandler, buildPaginationMeta, parsePagination, HttpError } from "@unkora/utils";
import { prisma } from "@unkora/database";

export class CouponController {
  validate = asyncHandler(async (req: Request, res: Response) => {
    const { code, cart_total } = req.body as { code: string; cart_total: number };
    const coupon = await prisma.coupon.findFirst({ where: { code: code.toUpperCase(), is_active: true, valid_from: { lte: new Date() }, valid_until: { gte: new Date() } } });
    if (!coupon) throw HttpError.BadRequest("Invalid or expired coupon", "INVALID_COUPON", "কুপনটি বৈধ নয়");
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) throw HttpError.BadRequest("Coupon exhausted", "COUPON_EXHAUSTED");
    if (coupon.min_order_amount && cart_total < coupon.min_order_amount) throw HttpError.BadRequest(`Minimum order amount: ৳${coupon.min_order_amount / 100}`, "MIN_AMOUNT_NOT_MET");

    let discount = 0;
    if (coupon.type === "PERCENTAGE") discount = Math.round(cart_total * coupon.value / 100);
    else if (coupon.type === "FIXED_AMOUNT") discount = Math.min(coupon.value, cart_total);
    if (coupon.max_discount_amount) discount = Math.min(discount, coupon.max_discount_amount);

    res.json({ success: true, data: { coupon, discount_amount: discount } });
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const { skip, take, page, perPage } = parsePagination(req.query as Record<string, string>);
    const [data, total] = await Promise.all([prisma.coupon.findMany({ skip, take, orderBy: { created_at: "desc" } }), prisma.coupon.count()]);
    res.json({ success: true, data, meta: buildPaginationMeta(total, page, perPage) });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const coupon = await prisma.coupon.create({ data: req.body as Parameters<typeof prisma.coupon.create>[0]["data"] });
    res.status(201).json({ success: true, data: coupon });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const coupon = await prisma.coupon.update({ where: { id: req.params["id"]! }, data: req.body as Parameters<typeof prisma.coupon.update>[0]["data"] });
    res.json({ success: true, data: coupon });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    await prisma.coupon.update({ where: { id: req.params["id"]! }, data: { is_active: false } });
    res.json({ success: true, message: "Coupon deactivated" });
  });
}
