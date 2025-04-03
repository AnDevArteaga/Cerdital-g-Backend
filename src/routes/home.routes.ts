import { Router } from "express";
import { getDataHomeController } from "../controllers/home/home.controller";

const router = Router();

router.get("/:user_id", getDataHomeController);

export default router;