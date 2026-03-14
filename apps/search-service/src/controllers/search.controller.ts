import { Request, Response } from "express";
import { asyncHandler, buildPaginationMeta, parsePagination } from "@unkora/utils";
import { prisma } from "@unkora/database";
import { redis } from "@unkora/database";

export class SearchController {
  search = asyncHandler(async (req: Request, res: Response) => {
    const { q = "", category, min_price, max_price, sort = "created_at", order = "desc" } = req.query as Record<string, string>;
    const { skip, take, page, perPage } = parsePagination(req.query as Record<string, string>);

    const where: Record<string, unknown> = { publish_status: "PUBLISHED", is_active: true, deleted_at: null };
    if (q) {
      where["OR"] = [
        { name_en: { contains: q, mode: "insensitive" } },
        { name_bn: { contains: q } },
        { short_description_en: { contains: q, mode: "insensitive" } },
        { tags: { has: q } },
      ];
    }
    if (category) where["category"] = { slug: category };
    if (min_price || max_price) {
      where["base_price"] = {
        ...(min_price ? { gte: parseInt(min_price) * 100 } : {}),
        ...(max_price ? { lte: parseInt(max_price) * 100 } : {}),
      };
    }

    const sortFields: Record<string, string> = { price: "base_price", rating: "rating_average", sold: "sales_count", created_at: "created_at" };
    const orderBy: Record<string, string> = {};
    orderBy[sortFields[sort] ?? "created_at"] = order;

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where, skip, take, orderBy,
        select: {
          id: true, slug: true, name_en: true, name_bn: true,
          base_price: true, sale_price: true, rating_average: true, rating_count: true,
          images: { where: { is_primary: true }, take: 1 },
          category: { select: { name_en: true, name_bn: true, slug: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Log search
    if (q) {
      void prisma.searchLog.create({ data: { query: q, results_count: total } });
    }

    res.json({ success: true, data, meta: buildPaginationMeta(total, page, perPage), query: q });
  });

  autocomplete = asyncHandler(async (req: Request, res: Response) => {
    const { q = "" } = req.query as { q: string };
    if (q.length < 2) { res.json({ success: true, data: [] }); return; }

    const cacheKey = `search:suggest:${q.toLowerCase()}`;
    const cached = await redis.getJson<unknown[]>(cacheKey);
    if (cached) { res.json({ success: true, data: cached }); return; }

    const results = await prisma.product.findMany({
      where: {
        OR: [
          { name_en: { contains: q, mode: "insensitive" } },
          { name_bn: { contains: q } },
        ],
        publish_status: "PUBLISHED", is_active: true,
      },
      take: 8,
      select: { id: true, slug: true, name_en: true, name_bn: true, images: { where: { is_primary: true }, take: 1 } },
    });

    await redis.setJson(cacheKey, results, 86400);
    res.json({ success: true, data: results });
  });

  trending = asyncHandler(async (_req: Request, res: Response) => {
    const logs = await prisma.searchLog.groupBy({
      by: ["query"],
      _count: { query: true },
      orderBy: { _count: { query: "desc" } },
      take: 10,
    });
    res.json({ success: true, data: logs.map(l => ({ query: l.query, count: l._count.query })) });
  });
}
