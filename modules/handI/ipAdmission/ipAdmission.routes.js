import express from "express";
import controller from "./ipAdmission.controller.js";
import auth from "../../../middleware/auth.js";
import role from "../../../middleware/role.js";

const router = express.Router();

// All IP admission endpoints require authentication and manager role
router.post("/", auth, role("manager"), controller.createIpAdmission);
router.get("/", auth, role("manager"), controller.getIpAdmissions);
router.get("/:id", auth, role("manager"), controller.getIpAdmissionById);
router.put("/:id", auth, role("manager"), controller.updateIpAdmission);
router.delete("/:id", auth, role("manager"), controller.deleteIpAdmission);

export default router;
