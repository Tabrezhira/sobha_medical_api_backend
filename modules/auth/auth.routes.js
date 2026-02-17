import express from "express";
import controller from "./auth.controller.js";
import auth from "../../middleware/auth.js";
import role from "../../middleware/role.js";

const router = express.Router();

// Public
router.post("/", controller.register);
router.post("/login", controller.login);
router.post("/refresh", auth, controller.refreshToken);

// Protected user management
router.get("/", auth, controller.getUsers);
router.get("/:id", auth, controller.getUserById);
router.put("/:id", auth, controller.updateUser);
router.delete("/:id", auth, role("manager"), controller.deleteUser);

export default router;
