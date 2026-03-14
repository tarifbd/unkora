import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/auth.middleware";

const router = Router();
const ctrl = new ProductController();

router.get("/",              ctrl.list);
router.get("/featured",      ctrl.getFeatured);
router.get("/flash-sale",    ctrl.getFlashSaleProducts);
router.get("/:slug",         ctrl.getBySlug);
router.get("/:id/related",   ctrl.getRelated);

router.post("/",           authMiddleware, requireRole("VENDOR", "ADMIN", "SUPER_ADMIN"), ctrl.create);
router.patch("/:id",       authMiddleware, requireRole("VENDOR", "ADMIN", "SUPER_ADMIN"), ctrl.update);
router.delete("/:id",      authMiddleware, requireRole("VENDOR", "ADMIN", "SUPER_ADMIN"), ctrl.remove);
router.post("/:id/publish",authMiddleware, requireRole("ADMIN", "SUPER_ADMIN"), ctrl.publish);
router.post("/bulk-import", authMiddleware, requireRole("ADMIN", "SUPER_ADMIN"), ctrl.bulkImport);

export { router as productRoutes };
