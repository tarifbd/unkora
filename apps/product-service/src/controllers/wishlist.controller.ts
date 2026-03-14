import { Request, Response } from "express";
import { asyncHandler } from "@unkora/utils";
import { prisma } from "@unkora/database";

export class WishlistController {
  getWishlist = asyncHandler(async (req: Request, res: Response) => {
    const items = await prisma.wishlist.findMany({
      where: { user_id: req.user!.id },
      include: { product: { select: { id: true, slug: true, name_en: true, name_bn: true, base_price: true, sale_price: true, images: { where: { is_primary: true }, take: 1 } } } },
    });
    res.json({ success: true, data: items });
  });

  add = asyncHandler(async (req: Request, res: Response) => {
    const item = await prisma.wishlist.upsert({
      where: { user_id_product_id: { user_id: req.user!.id, product_id: req.params["productId"]! } },
      create: { user_id: req.user!.id, product_id: req.params["productId"]! },
      update: {},
    });
    res.status(201).json({ success: true, data: item });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    await prisma.wishlist.deleteMany({ where: { user_id: req.user!.id, product_id: req.params["productId"]! } });
    res.json({ success: true, message: "Removed from wishlist" });
  });
}
