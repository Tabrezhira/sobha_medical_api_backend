import express from "express";
import controller from "./notAnsCall.controller.js";
import auth from "../../../middleware/auth.js";
import role from "../../../middleware/role.js";

const router = express.Router();

// All not answered call endpoints require authentication and manager role
router.post("/", auth, role(["manager", "superadmin"]), controller.createNotAnsCall);
router.get("/", auth, role(["manager", "superadmin"]), controller.getNotAnsCalls);
router.get("/empnos/:date", auth, role(["manager", "superadmin"]), controller.getEmpNosByDate);
router.get("/:id", auth, role(["manager", "superadmin"]), controller.getNotAnsCallById);
router.put("/:id", auth, role(["manager", "superadmin"]), controller.updateNotAnsCall);
router.delete("/:id", auth, role(["manager", "superadmin"]), controller.deleteNotAnsCall);

export default router;
