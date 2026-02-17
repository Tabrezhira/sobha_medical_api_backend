import express from "express";
import controller from "./notAnsCall.controller.js";
import auth from "../../../middleware/auth.js";
import role from "../../../middleware/role.js";

const router = express.Router();

// All not answered call endpoints require authentication and manager role
router.post("/", auth, role("manager"), controller.createNotAnsCall);
router.get("/", auth, role("manager"), controller.getNotAnsCalls);
router.get("/:id", auth, role("manager"), controller.getNotAnsCallById);
router.put("/:id", auth, role("manager"), controller.updateNotAnsCall);
router.delete("/:id", auth, role("manager"), controller.deleteNotAnsCall);

export default router;
