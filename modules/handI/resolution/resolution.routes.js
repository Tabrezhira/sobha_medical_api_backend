import express from "express";
import controller from "./resolution.controller.js";
import auth from "../../../middleware/auth.js";
import role from "../../../middleware/role.js";

const router = express.Router();

// All resolution endpoints require authentication and manager role
router.post("/", auth, role("manager"), controller.createCaseResolution);
router.get("/", auth, role("manager"), controller.getCaseResolutions);
router.get("/:id", auth, role("manager"), controller.getCaseResolutionById);
router.put("/:id", auth, role("manager"), controller.updateCaseResolution);
router.delete("/:id", auth, role("manager"), controller.deleteCaseResolution);

export default router;
