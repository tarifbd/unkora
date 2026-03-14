import { Router } from "express";
import { DeliveryController } from "../controllers/delivery.controller";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";

const router = Router();
const ctrl = new DeliveryController();

router.get("/zones",                ctrl.getZones);
router.get("/zones/:district",      ctrl.getZoneByDistrict);
router.post("/estimate",            ctrl.estimateCost);
router.get("/:orderId/track",       ctrl.track);
router.post("/assign",              authMiddleware, requireRole("ADMIN","SUPER_ADMIN"), ctrl.assign);
router.post("/:deliveryId/event",   authMiddleware, requireRole("ADMIN","SUPER_ADMIN"), ctrl.addEvent);
router.get("/",                     authMiddleware, requireRole("ADMIN","SUPER_ADMIN"), ctrl.list);

export { router as deliveryRoutes };
