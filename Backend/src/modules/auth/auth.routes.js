import express from "express";
import validate from "../../shared/middlewares/validate.js";
import { loginSchema } from "./auth.schema.js";
import { login, forgotPassword, getMe } from "./auth.controller.js";
import authMiddleware from "../../shared/middlewares/auth.js";

const router = express.Router();

// Public routes (NO authMiddleware here)
router.post("/login", validate(loginSchema), login);
router.post("/forgot-password", forgotPassword);

// Protected routes
router.get("/me", authMiddleware, getMe);

export default router;