import { Router } from "express";
import { sendTestPush } from "../controllers/push/push.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const pushRouter = Router();

pushRouter.post("/test", authMiddleware, sendTestPush);

export default pushRouter;