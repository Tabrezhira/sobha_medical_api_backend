import express from "express";
import controller from "./memberFeedback.controller.js";
import auth from "../../../middleware/auth.js";
import role from "../../../middleware/role.js";

const router = express.Router();

// All member feedback endpoints require authentication and manager role
router.post("/", auth, role("manager"), controller.createMemberFeedback);
router.get("/", auth, role("manager"), controller.getMemberFeedback);
router.get("/:id", auth, role("manager"), controller.getMemberFeedbackById);
router.put("/:id", auth, role("manager"), controller.updateMemberFeedback);
router.delete("/:id", auth, role("manager"), controller.deleteMemberFeedback);

export default router;
