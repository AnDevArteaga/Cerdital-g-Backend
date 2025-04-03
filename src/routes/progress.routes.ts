import { Router } from "express";
import { getProgressById, updateProgress, createProgress } from "../controllers/progress/progress.controller";
import { authMiddleware } from "../middleware/auth.middleware";
const router = Router();

router.get("/getProgressById/:user_id", authMiddleware, getProgressById);
router.put("/editProgress/:progress_id", authMiddleware, updateProgress);
router.post("/createProgress", authMiddleware, createProgress);

export default router;