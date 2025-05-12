import { Router } from "express";
import { createHealth, editHealth, getHealthById, deleteHealth } from "../controllers/health/health.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { healthCacheKeyBuilder, healthFormatter } from "../utils/healthCache";
import { cacheMiddleware } from "../middleware/cache.middleware";
const router = Router();

router.post("/createHealth", authMiddleware, createHealth);
router.get("/getHealthById/:user_id", authMiddleware, getHealthById);
router.put("/editHealth/:health_id", authMiddleware, editHealth);
router.delete("/deleteHealth/:health_id", authMiddleware, deleteHealth);

export default router;