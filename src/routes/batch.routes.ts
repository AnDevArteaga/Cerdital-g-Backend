import { Router } from "express";
import { createBatch, getBatchById, editBatch } from "../controllers/batch/batch.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { cacheMiddleware } from "../middleware/cache.middleware";
import { batchCacheKeyBuilder, batchFormatter } from "../utils/batchCache";


const router = Router();

router.post("/createBatch", authMiddleware,createBatch);
router.get("/getBatchById/:user_id", authMiddleware, cacheMiddleware(batchCacheKeyBuilder, batchFormatter), getBatchById);
router.put("/editBatch/:batch_id", authMiddleware, editBatch);


export default router;