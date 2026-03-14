import { Router } from "express";
import { VendorController } from "../controllers/vendor.controller";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";

const router = Router();
const ctrl = new VendorController();

router.get("/",           authMiddleware, requireRole("ADMIN", "SUPER_ADMIN"), ctrl.list);
router.get("/:id",        ctrl.getById);
router.get("/me",         authMiddleware, requireRole("VENDOR"), ctrl.getMyStore);
router.post("/",          authMiddleware, ctrl.register);
router.patch("/me",       authMiddleware, requireRole("VENDOR"), ctrl.updateMyStore);
router.patch("/:id/approve", authMiddleware, requireRole("ADMIN", "SUPER_ADMIN"), ctrl.approve);
router.patch("/:id/reject",  authMiddleware, requireRole("ADMIN", "SUPER_ADMIN"), ctrl.reject);

export { router as vendorRoutes };
