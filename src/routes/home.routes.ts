import { Router } from "express";
import { getDataHomeController } from "../controllers/home/home.controller";
import { authMiddleware, ownsUser } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.get("/:user_id", ownsUser, getDataHomeController);

export default router;