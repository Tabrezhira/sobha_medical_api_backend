import express from "express";
import controller from "./grievance.controller.js";
import auth from "../../../middleware/auth.js";
import role from "../../../middleware/role.js";

const router = express.Router();

// All grievance endpoints require authentication and manager role
router.post("/", auth, role("manager"), controller.createGrievance);
router.get("/", auth, role("manager"), controller.getGrievances);
router.get("/:id", auth, role("manager"), controller.getGrievanceById);
router.put("/:id", auth, role("manager"), controller.updateGrievance);
router.delete("/:id", auth, role("manager"), controller.deleteGrievance);

export default router;
