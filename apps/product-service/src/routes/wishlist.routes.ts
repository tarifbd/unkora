import { Router } from "express";
import { WishlistController } from "../controllers/wishlist.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const ctrl = new WishlistController();

router.get("/",           authMiddleware, ctrl.getWishlist);
router.post("/:productId",authMiddleware, ctrl.add);
router.delete("/:productId", authMiddleware, ctrl.remove);

export { router as wishlistRoutes };
