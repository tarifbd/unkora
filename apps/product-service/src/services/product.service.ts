import { prisma } from "@unkora/database";
import { redis, REDIS_KEYS } from "@unkora/database";
import { HttpError, buildPaginationMeta, generateSlug, createLogger } from "@unkora/utils";
import type { UserRole } from "@unkora/types";

const logger = createLogger("product.service");

export class ProductService {
  async listProducts(filters: Record<string, string>, pagination: { skip: number; take: number; page: number; perPage: number }) {
    const where: Record<string, unknown> = { publish_status: "PUBLISHED", is_active: true, deleted_at: null };

    if (filters["category"]) where["category"] = { slug: filters["category"] };
    if (filters["brand"]) where["brand"] = { slug: filters["brand"] };
    if (filters["vendor_id"]) where["vendor_id"] = filters["vendor_id"];
    if (filters["is_featured"] === "true") where["is_featured"] = true;
    if (filters["min_price"] || filters["max_price"]) {
      where["base_price"] = {
        ...(filters["min_price"] ? { gte: parseInt(filters["min_price"]) } : {}),
        ...(filters["max_price"] ? { lte: parseInt(filters["max_price"]) } : {}),
      };
    }
    if (filters["q"]) {
      where["OR"] = [
        { name_en: { contains: filters["q"], mode: "insensitive" } },
        { name_bn: { contains: filters["q"] } },
        { tags: { has: filters["q"] } },
      ];
    }

    const sortField = filters["sort"] ?? "created_at";
    const sortOrder = filters["order"] ?? "desc";
    const orderBy: Record<string, string> = {};
    const allowed = ["created_at", "base_price", "sales_count", "rating_average", "views_count"];
    if (allowed.includes(sortField)) orderBy[sortField] = sortOrder;

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where, skip: pagination.skip, take: pagination.take,
        orderBy,
        select: {
          id: true, sku: true, slug: true, name_en: true, name_bn: true,
          base_price: true, sale_price: true, stock_quantity: true,
          rating_average: true, rating_count: true, is_featured: true,
          images: { where: { is_primary: true }, take: 1, select: { url: true, alt_text: true } },
          category: { select: { id: true, name_en: true, name_bn: true, slug: true } },
          brand: { select: { id: true, name: true, logo: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { data, meta: buildPaginationMeta(total, pagination.page, pagination.perPage) };
  }

  async getBySlug(slug: string) {
    const cacheKey = REDIS_KEYS.product(slug);
    const cached = await redis.getJson<unknown>(cacheKey);
    if (cached) return cached;

    const product = await prisma.product.findFirst({
      where: { slug, publish_status: "PUBLISHED", deleted_at: null },
      include: {
        images: { orderBy: { sort_order: "asc" } },
        variants: { where: { is_active: true } },
        category: true,
        brand: true,
        vendor: { select: { id: true, shop_name_en: true, slug: true, rating: true, logo: true } },
        book_detail: true, leather_detail: true,
        baby_product_detail: true, islamic_product_detail: true, organic_food_detail: true,
        reviews: { where: { is_approved: true }, take: 10, orderBy: { created_at: "desc" }, include: { user: { select: { name_en: true, avatar: true } } } },
      },
    });

    if (!product) throw HttpError.NotFound("Product not found", "PRODUCT_NOT_FOUND", "পণ্য পাওয়া যায়নি");

    // Increment views async
    void prisma.product.update({ where: { id: product.id }, data: { views_count: { increment: 1 } } });

    await redis.setJson(cacheKey, product, 3600);
    return product;
  }

  async getFeatured() {
    return prisma.product.findMany({
      where: { is_featured: true, publish_status: "PUBLISHED", deleted_at: null },
      take: 12,
      orderBy: { sales_count: "desc" },
      select: {
        id: true, slug: true, name_en: true, name_bn: true,
        base_price: true, sale_price: true, rating_average: true, rating_count: true,
        images: { where: { is_primary: true }, take: 1 },
      },
    });
  }

  async getActiveFlashSale() {
    const now = new Date();
    return prisma.flashSale.findFirst({
      where: { is_active: true, start_time: { lte: now }, end_time: { gte: now } },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true, slug: true, name_en: true, name_bn: true, base_price: true,
                images: { where: { is_primary: true }, take: 1 },
              },
            },
          },
        },
      },
    });
  }

  async getRelated(productId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { category_id: true, tags: true } });
    if (!product) return [];
    return prisma.product.findMany({
      where: { id: { not: productId }, category_id: product.category_id, publish_status: "PUBLISHED", deleted_at: null },
      take: 8,
      orderBy: { sales_count: "desc" },
      select: { id: true, slug: true, name_en: true, name_bn: true, base_price: true, sale_price: true, images: { where: { is_primary: true }, take: 1 } },
    });
  }

  async create(data: Record<string, unknown>, userId: string, role: UserRole) {
    let vendorId: string | undefined;
    if (role === "VENDOR") {
      const vendor = await prisma.vendor.findFirst({ where: { user_id: userId, status: "APPROVED" } });
      if (!vendor) throw HttpError.Forbidden("Vendor not approved", "VENDOR_NOT_APPROVED");
      vendorId = vendor.id;
    }

    const slug = generateSlug(data["name_en"] as string);
    return prisma.product.create({
      data: {
        ...data as Record<string, unknown>,
        vendor_id: vendorId ?? null,
        slug,
        publish_status: role === "VENDOR" ? "PENDING_REVIEW" : "DRAFT",
      } as Parameters<typeof prisma.product.create>[0]["data"],
    });
  }

  async update(id: string, data: Record<string, unknown>, userId: string, role: UserRole) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw HttpError.NotFound("Product not found");
    if (role === "VENDOR") {
      const vendor = await prisma.vendor.findFirst({ where: { user_id: userId } });
      if (product.vendor_id !== vendor?.id) throw HttpError.Forbidden("Not your product");
    }
    const updated = await prisma.product.update({ where: { id }, data: data as Parameters<typeof prisma.product.update>[0]["data"] });
    await redis.del(REDIS_KEYS.product(product.slug));
    return updated;
  }

  async remove(id: string, userId: string, role: UserRole) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw HttpError.NotFound("Product not found");
    if (role === "VENDOR") {
      const vendor = await prisma.vendor.findFirst({ where: { user_id: userId } });
      if (product.vendor_id !== vendor?.id) throw HttpError.Forbidden("Not your product");
    }
    await prisma.product.update({ where: { id }, data: { deleted_at: new Date(), is_active: false } });
    await redis.del(REDIS_KEYS.product(product.slug));
  }

  async publish(id: string) {
    const updated = await prisma.product.update({ where: { id }, data: { publish_status: "PUBLISHED" } });
    await redis.del(REDIS_KEYS.product(updated.slug));
    return updated;
  }

  async bulkImport(payload: { products: Record<string, unknown>[] }) {
    let created = 0, failed = 0;
    for (const p of payload.products) {
      try {
        const slug = generateSlug(p["name_en"] as string);
        await prisma.product.create({ data: { ...p, slug } as Parameters<typeof prisma.product.create>[0]["data"] });
        created++;
      } catch { failed++; }
    }
    return { created, failed };
  }
}
