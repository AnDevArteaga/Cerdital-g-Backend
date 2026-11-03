import { Router } from "express";
import { createHealth, editHealth, getHealthById, deleteHealth } from "../controllers/health/health.controller";
import { authMiddleware, ownsUser } from "../middleware/auth.middleware";
import { healthCacheKeyBuilder, healthFormatter } from "../utils/healthCache";
import { cacheMiddleware } from "../middleware/cache.middleware";
const router = Router();

router.use(authMiddleware);
router.post("/createHealth", ownsUser, createHealth);
router.get("/getHealthById/:user_id", ownsUser, getHealthById);
router.put("/editHealth/:health_id", ownsUser, editHealth);
router.delete("/deleteHealth/:health_id", deleteHealth);

export default router;