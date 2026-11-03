import { Router } from "express";
import { getAgenda, createAgenda } from "../controllers/agenda/agenda.controller";
import { authMiddleware, ownsUser } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.get("/:user_id", ownsUser, getAgenda);
router.post("/", ownsUser, createAgenda);

export default router;