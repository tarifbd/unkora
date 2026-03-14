import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const ctrl = new PaymentController();

router.post("/initiate",            authMiddleware, ctrl.initiate);
router.get("/:orderId",             authMiddleware, ctrl.getByOrder);
router.post("/sslcommerz/ipn",      ctrl.sslcommerzIpn);
router.post("/sslcommerz/success",  ctrl.sslcommerzSuccess);
router.post("/sslcommerz/fail",     ctrl.sslcommerzFail);
router.post("/bkash/callback",      ctrl.bkashCallback);
router.post("/nagad/callback",      ctrl.nagadCallback);
router.post("/:id/refund",          authMiddleware, ctrl.refund);

export { router as paymentRoutes };
