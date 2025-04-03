import { Router } from "express";
import { getFeedingTypeList, getFeedingMarkList } from "../controllers/lists/feedingList.controller";
import { getDiseaseList } from "../controllers/lists/healtList.controller";
import { getRaceList, getRaceTypeList } from "../controllers/lists/raceList.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/getFeedingTypeList", authMiddleware, getFeedingTypeList);
router.get("/getFeedingMarkList/:feeding_type_id", authMiddleware, getFeedingMarkList);
router.get("/getDiseaseList", authMiddleware, getDiseaseList);
router.get("/getRaceList/:race_type_id", authMiddleware, getRaceList);
router.get("/getRaceTypeList", authMiddleware, getRaceTypeList);

export default router;