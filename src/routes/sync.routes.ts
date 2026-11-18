import { Router } from "express";
import { pullSync, pushSync } from "../controllers/sync/sync.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.post("/push", pushSync);
router.get("/pull", pullSync);

export default router;
