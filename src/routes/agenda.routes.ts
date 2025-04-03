import { Router } from "express";
import { getAgenda, createAgenda } from "../controllers/agenda/agenda.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/:user_id", authMiddleware, getAgenda);
router.post("/", authMiddleware,createAgenda);

export default router;