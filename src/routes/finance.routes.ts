import { Router } from "express";
import { getCostById, editCost } from "../controllers/finance/cost.controller";
import { createSales, getSalesById, deleteSales } from "../controllers/finance/sales.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { cacheMiddleware } from "../middleware/cache.middleware";
import { salesCacheKeyBuilder, salesFormatter } from "../utils/salesCache";

const router = Router();

router.get("/getCostById/:user_id", authMiddleware, getCostById);
router.put("/editCost/:cost_id", authMiddleware, editCost);

router.post("/createSales", authMiddleware, createSales)
router.get("/getSalesById/:user_id", authMiddleware, cacheMiddleware(salesCacheKeyBuilder, salesFormatter), getSalesById);
// router.put("/editSales/:sales_id", authMiddleware, editSales);
router.delete("/deleteSales/:sales_id", authMiddleware, deleteSales);

export default router;