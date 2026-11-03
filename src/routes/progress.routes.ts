import { Router } from "express";
import { getProgressById, updateProgress, createProgress } from "../controllers/progress/progress.controller";
import { authMiddleware, ownsUser } from "../middleware/auth.middleware";
const router = Router();

router.use(authMiddleware);
router.get("/getProgressById/:user_id", ownsUser, getProgressById);
router.put("/editProgress/:progress_id", ownsUser, updateProgress);
router.post("/createProgress", ownsUser, createProgress);

export default router;