import { Router } from "express";
import { getFeedingTypeList, getFeedingMarkList } from "../controllers/lists/feedingList.controller";
import { getDiseaseList } from "../controllers/lists/healtList.controller";
import { getRaceList, getRaceTypeList } from "../controllers/lists/raceList.controller";
import { getPhaseList } from "../controllers/lists/phaseList.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.get("/getFeedingTypeList", getFeedingTypeList);
router.get("/getFeedingMarkList/:feeding_type_id", getFeedingMarkList);
router.get("/getDiseaseList", getDiseaseList);
router.get("/getRaceList/:race_type_id", getRaceList);
router.get("/getRaceTypeList", getRaceTypeList);
router.get("/getPhaseList", getPhaseList);

export default router;