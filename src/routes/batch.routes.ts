import { Router } from "express";
import { createBatch, getBatchById, editBatch } from "../controllers/batch/batch.controller";
import { authMiddleware, ownsUser } from "../middleware/auth.middleware";
import { cacheMiddleware } from "../middleware/cache.middleware";
import { batchCacheKeyBuilder, batchFormatter } from "../utils/batchCache";


const router = Router();

router.use(authMiddleware);
router.post("/createBatch", ownsUser, createBatch);
router.get("/getBatchById/:user_id", ownsUser, cacheMiddleware(batchCacheKeyBuilder, batchFormatter), getBatchById);
router.put("/editBatch/:batch_id", ownsUser, editBatch);


export default router;