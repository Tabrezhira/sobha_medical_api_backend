import express from "express";
import controller from "./happinessSurvey.controller.js";
import auth from "../../../middleware/auth.js";
import role from "../../../middleware/role.js";
import { happinessSurveyUpload } from "../../../middleware/upload.js";

const router = express.Router();

// All happiness survey endpoints require authentication and manager role
router.post("/", auth, role("manager"), happinessSurveyUpload, controller.createHappinessSurvey);
router.get("/", auth, role("manager"), controller.getHappinessSurveys);
router.get("/:id", auth, role("manager"), controller.getHappinessSurveyById);
router.put("/:id", auth, role("manager"), happinessSurveyUpload, controller.updateHappinessSurvey);
router.delete("/:id", auth, role("manager"), controller.deleteHappinessSurvey);

export default router;
