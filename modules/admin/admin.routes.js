import express from "express";
import controller from "./admin.controller.js";
import auth from "../../middleware/auth.js";
import role from "../../middleware/role.js";

const router = express.Router();

// All admin endpoints require superadmin role
router.get("/status", auth, role("superadmin"), controller.getSystemInfo);
router.get("/stats", auth, role("superadmin"), controller.getStats);
router.get("/users", auth, role("superadmin"), controller.getUsers);

export default router;
