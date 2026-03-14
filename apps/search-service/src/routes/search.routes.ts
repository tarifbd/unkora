import { Router } from "express";
import { SearchController } from "../controllers/search.controller";
const router = Router();
const ctrl = new SearchController();

router.get("/",            ctrl.search);
router.get("/autocomplete",ctrl.autocomplete);
router.get("/trending",    ctrl.trending);

export { router as searchRoutes };
