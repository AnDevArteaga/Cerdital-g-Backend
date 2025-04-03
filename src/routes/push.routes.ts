import { Router } from "express";
import { sendTestPush } from "../controllers/push/push.controller";

const pushRouter = Router();

pushRouter.post("/test", sendTestPush);

export default pushRouter;