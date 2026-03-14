import { Request, Response } from "express";
import { asyncHandler } from "@unkora/utils";
import { prisma } from "@unkora/database";
import { redis } from "@unkora/database";
import { HttpError, generateSlug } from "@unkora/utils";

export class CategoryController {
  list = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await prisma.category.findMany({ where: { is_active: true }, orderBy: { sort_order: "asc" } });
    res.json({ success: true, data: categories });
  });

  getTree = asyncHandler(async (_req: Request, res: Response) => {
    const cached = await redis.getJson<unknown>("category:tree");
    if (cached) { res.json({ success: true, data: cached }); return; }
    const all = await prisma.category.findMany({ where: { is_active: true, parent_id: null }, orderBy: { sort_order: "asc" }, include: { children: { include: { children: true } } } });
    await redis.setJson("category:tree", all, 21600);
    res.json({ success: true, data: all });
  });

  getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const cat = await prisma.category.findFirst({ where: { slug: req.params["slug"]! } });
    if (!cat) throw HttpError.NotFound("Category not found");
    res.json({ success: true, data: cat });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body as Record<string, unknown>;
    const slug = generateSlug(data["name_en"] as string);
    const cat = await prisma.category.create({ data: { ...data, slug } as Parameters<typeof prisma.category.create>[0]["data"] });
    await redis.del("category:tree");
    res.status(201).json({ success: true, data: cat });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const cat = await prisma.category.update({ where: { id: req.params["id"]! }, data: req.body as Parameters<typeof prisma.category.update>[0]["data"] });
    await redis.del("category:tree");
    res.json({ success: true, data: cat });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    await prisma.category.update({ where: { id: req.params["id"]! }, data: { is_active: false } });
    await redis.del("category:tree");
    res.json({ success: true, message: "Category deactivated" });
  });
}
