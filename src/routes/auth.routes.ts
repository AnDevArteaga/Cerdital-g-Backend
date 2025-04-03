import { Router } from "express";
import { login, register, checkUser, changePassword, logout } from "../controllers/auth/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/checkUser", checkUser);
router.post("/changePassword", changePassword);
router.post("/logout/:id", authMiddleware, logout);

export default router;