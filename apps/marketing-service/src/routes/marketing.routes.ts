import { Router } from "express";
import { asyncHandler, HttpError } from "@unkora/utils";
import { loyaltyService, rfmService, fbConversions } from "../services/marketing.service";
import type { Request, Response } from "express";

export const marketingRouter = Router();

// Loyalty
marketingRouter.get("/loyalty/:userId", asyncHandler(async (req: Request, res: Response) => {
  const data = await loyaltyService.getUserLoyalty(req.params["userId"]!);
  if (!data) throw HttpError.NotFound("User not found");
  res.json({ success: true, data });
}));

marketingRouter.post("/loyalty/redeem", asyncHandler(async (req: Request, res: Response) => {
  const { user_id, points, order_id } = req.body as { user_id: string; points: number; order_id: string };
  const discount = await loyaltyService.redeemPoints(user_id, points, order_id);
  res.json({ success: true, data: { discount_amount: discount } });
}));

// RFM
marketingRouter.post("/rfm/rebuild", asyncHandler(async (_req: Request, res: Response) => {
  await rfmService.buildSegments();
  res.json({ success: true, message: "RFM segments rebuilt" });
}));

// Facebook pixel events
marketingRouter.post("/track/add-to-cart", asyncHandler(async (req: Request, res: Response) => {
  const { product_id, value } = req.body as { product_id: string; value: number };
  await fbConversions.trackAddToCart(product_id, value);
  res.json({ success: true });
}));
