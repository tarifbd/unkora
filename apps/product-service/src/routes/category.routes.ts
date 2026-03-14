import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";

const router = Router();
const ctrl = new CategoryController();

router.get("/",        ctrl.list);
router.get("/tree",    ctrl.getTree);
router.get("/:slug",   ctrl.getBySlug);
router.post("/",       authMiddleware, requireRole("ADMIN", "SUPER_ADMIN"), ctrl.create);
router.patch("/:id",   authMiddleware, requireRole("ADMIN", "SUPER_ADMIN"), ctrl.update);
router.delete("/:id",  authMiddleware, requireRole("ADMIN", "SUPER_ADMIN"), ctrl.remove);

export { router as categoryRoutes };
