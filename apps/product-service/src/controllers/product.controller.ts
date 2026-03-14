import { Request, Response } from "express";
import { ProductService } from "../services/product.service";
import { asyncHandler, parsePagination } from "@unkora/utils";

const svc = new ProductService();

export class ProductController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const pagination = parsePagination(req.query as Record<string, string>);
    const result = await svc.listProducts(req.query as Record<string, string>, pagination);
    res.json({ success: true, ...result });
  });

  getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const product = await svc.getBySlug(req.params["slug"]!);
    res.json({ success: true, data: product });
  });

  getFeatured = asyncHandler(async (_req: Request, res: Response) => {
    const products = await svc.getFeatured();
    res.json({ success: true, data: products });
  });

  getFlashSaleProducts = asyncHandler(async (_req: Request, res: Response) => {
    const data = await svc.getActiveFlashSale();
    res.json({ success: true, data });
  });

  getRelated = asyncHandler(async (req: Request, res: Response) => {
    const products = await svc.getRelated(req.params["id"]!);
    res.json({ success: true, data: products });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const product = await svc.create(req.body as Record<string, unknown>, req.user!.id, req.user!.role);
    res.status(201).json({ success: true, data: product });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const product = await svc.update(req.params["id"]!, req.body as Record<string, unknown>, req.user!.id, req.user!.role);
    res.json({ success: true, data: product });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    await svc.remove(req.params["id"]!, req.user!.id, req.user!.role);
    res.json({ success: true, message: "Product deleted" });
  });

  publish = asyncHandler(async (req: Request, res: Response) => {
    const product = await svc.publish(req.params["id"]!);
    res.json({ success: true, data: product });
  });

  bulkImport = asyncHandler(async (req: Request, res: Response) => {
    const result = await svc.bulkImport(req.body as { products: Record<string, unknown>[] });
    res.json({ success: true, data: result });
  });
}
