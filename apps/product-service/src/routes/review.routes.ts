import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";

const router = Router();
const ctrl = new ReviewController();

router.get("/product/:productId",     ctrl.getByProduct);
router.post("/",                      authMiddleware, ctrl.create);
router.patch("/:id/helpful",          authMiddleware, ctrl.markHelpful);
router.patch("/:id/approve",          authMiddleware, requireRole("ADMIN", "SUPER_ADMIN"), ctrl.approve);
router.patch("/:id/reply",            authMiddleware, requireRole("ADMIN", "SUPER_ADMIN"), ctrl.adminReply);
router.delete("/:id",                 authMiddleware, requireRole("ADMIN", "SUPER_ADMIN"), ctrl.remove);

export { router as reviewRoutes };
