import { Router } from "express";
import { CartController } from "../controllers/cart.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const ctrl = new CartController();

router.get("/",                   authMiddleware, ctrl.getCart);
router.post("/items",             ctrl.addItem);
router.patch("/items/:itemId",    ctrl.updateItem);
router.delete("/items/:itemId",   ctrl.removeItem);
router.delete("/",                ctrl.clearCart);
router.post("/coupon",            ctrl.applyCoupon);
router.delete("/coupon",          ctrl.removeCoupon);
router.post("/merge",             authMiddleware, ctrl.mergeGuestCart);

export { router as cartRoutes };
