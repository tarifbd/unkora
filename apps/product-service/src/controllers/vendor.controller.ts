import { Request, Response } from "express";
import { asyncHandler, buildPaginationMeta, parsePagination, HttpError, generateSlug } from "@unkora/utils";
import { prisma } from "@unkora/database";

export class VendorController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const { skip, take, page, perPage } = parsePagination(req.query as Record<string, string>);
    const [data, total] = await Promise.all([
      prisma.vendor.findMany({ skip, take, orderBy: { created_at: "desc" } }),
      prisma.vendor.count(),
    ]);
    res.json({ success: true, data, meta: buildPaginationMeta(total, page, perPage) });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const vendor = await prisma.vendor.findUnique({ where: { id: req.params["id"]! }, include: { user: { select: { name_en: true, avatar: true } } } });
    if (!vendor) throw HttpError.NotFound("Vendor not found");
    res.json({ success: true, data: vendor });
  });

  getMyStore = asyncHandler(async (req: Request, res: Response) => {
    const vendor = await prisma.vendor.findFirst({ where: { user_id: req.user!.id } });
    if (!vendor) throw HttpError.NotFound("Vendor store not found");
    res.json({ success: true, data: vendor });
  });

  register = asyncHandler(async (req: Request, res: Response) => {
    const existing = await prisma.vendor.findFirst({ where: { user_id: req.user!.id } });
    if (existing) throw HttpError.Conflict("Already registered as vendor");
    const data = req.body as Record<string, unknown>;
    const slug = generateSlug(data["shop_name_en"] as string);
    const vendor = await prisma.vendor.create({ data: { ...data, user_id: req.user!.id, slug } as Parameters<typeof prisma.vendor.create>[0]["data"] });
    res.status(201).json({ success: true, data: vendor });
  });

  updateMyStore = asyncHandler(async (req: Request, res: Response) => {
    const vendor = await prisma.vendor.findFirst({ where: { user_id: req.user!.id } });
    if (!vendor) throw HttpError.NotFound("Vendor not found");
    const updated = await prisma.vendor.update({ where: { id: vendor.id }, data: req.body as Parameters<typeof prisma.vendor.update>[0]["data"] });
    res.json({ success: true, data: updated });
  });

  approve = asyncHandler(async (req: Request, res: Response) => {
    const vendor = await prisma.vendor.update({ where: { id: req.params["id"]! }, data: { status: "APPROVED" } });
    await prisma.user.update({ where: { id: vendor.user_id }, data: { role: "VENDOR" } });
    res.json({ success: true, data: vendor });
  });

  reject = asyncHandler(async (req: Request, res: Response) => {
    const { reason } = req.body as { reason: string };
    const vendor = await prisma.vendor.update({ where: { id: req.params["id"]! }, data: { status: "REJECTED", rejection_reason: reason } });
    res.json({ success: true, data: vendor });
  });
}
