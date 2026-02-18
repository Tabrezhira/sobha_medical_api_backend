import express from "express";
import controller from "./memberFeedback.controller.js";
import auth from "../../../middleware/auth.js";
import role from "../../../middleware/role.js";

const router = express.Router();

// All member feedback endpoints require authentication and manager role
router.post("/", auth, role(["manager", "superadmin"]), controller.createMemberFeedback);
router.get("/", auth, role(["manager", "superadmin"]), controller.getMemberFeedback);
router.get("/:id", auth, role(["manager", "superadmin"]), controller.getMemberFeedbackById);
router.put("/:id", auth, role(["manager", "superadmin"]), controller.updateMemberFeedback);
router.delete("/:id", auth, role(["manager", "superadmin"]), controller.deleteMemberFeedback);

export default router;
