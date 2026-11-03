import { Router } from "express";
import { getCostById, editCost } from "../controllers/finance/cost.controller";
import { createSales, getSalesById, deleteSales } from "../controllers/finance/sales.controller";
import { authMiddleware, ownsUser } from "../middleware/auth.middleware";
import { cacheMiddleware } from "../middleware/cache.middleware";
import { salesCacheKeyBuilder, salesFormatter } from "../utils/salesCache";

const router = Router();

router.use(authMiddleware);
router.get("/getCostById/:user_id", ownsUser, getCostById);
router.put("/editCost/:cost_id", ownsUser, editCost);

router.post("/createSales", ownsUser, createSales)
router.get("/getSalesById/:user_id", ownsUser, cacheMiddleware(salesCacheKeyBuilder, salesFormatter), getSalesById);
router.delete("/deleteSales/:sales_id", deleteSales);

export default router;