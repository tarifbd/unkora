import { Router } from "express";
import { CouponController } from "../controllers/coupon.controller";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";

const router = Router();
const ctrl = new CouponController();

router.post("/validate",  authMiddleware, ctrl.validate);
router.get("/",           authMiddleware, requireRole("ADMIN","SUPER_ADMIN"), ctrl.list);
router.post("/",          authMiddleware, requireRole("ADMIN","SUPER_ADMIN"), ctrl.create);
router.patch("/:id",      authMiddleware, requireRole("ADMIN","SUPER_ADMIN"), ctrl.update);
router.delete("/:id",     authMiddleware, requireRole("ADMIN","SUPER_ADMIN"), ctrl.remove);

export { router as couponRoutes };
