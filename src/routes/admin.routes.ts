import { Router } from "express";
import { getOverview, getUser, postUser } from "../controllers/admin/admin.controller";
import { authMiddleware, requireSuper } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware, requireSuper);
router.get("/overview", getOverview);
router.get("/users/:id", getUser);
router.post("/users", postUser);

export default router;
