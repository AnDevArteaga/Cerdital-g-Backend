import { Router } from "express";
import { createFeeding, editFeeding, getFeedingById } from "../controllers/feeding/feeding.controller";
import { authMiddleware, ownsUser } from "../middleware/auth.middleware";
import { cacheMiddleware } from "../middleware/cache.middleware";
import { feedingCacheKeyBuilder, feedingFormatter } from "../utils/feedingCache";
const router = Router();

router.use(authMiddleware);
router.post("/createFeeding", ownsUser, createFeeding);
router.get("/getFeedingById/:user_id", ownsUser, cacheMiddleware(feedingCacheKeyBuilder, feedingFormatter), getFeedingById);
router.put("/editFeeding/:feeding_id", ownsUser, editFeeding);


export default router;