import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";

const router = Router();
const ctrl = new OrderController();

router.post("/checkout",           authMiddleware, ctrl.checkout);
router.get("/",                    authMiddleware, ctrl.list);
router.get("/:orderNumber",        authMiddleware, ctrl.getByNumber);
router.get("/:orderNumber/invoice",authMiddleware, ctrl.getInvoice);
router.patch("/:id/cancel",        authMiddleware, ctrl.cancel);
router.post("/:id/return",         authMiddleware, ctrl.requestReturn);
router.patch("/:id/status",        authMiddleware, requireRole("ADMIN","SUPER_ADMIN"), ctrl.updateStatus);
router.get("/admin/all",           authMiddleware, requireRole("ADMIN","SUPER_ADMIN"), ctrl.adminList);

export { router as orderRoutes };
