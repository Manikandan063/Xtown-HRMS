import express from "express";
import validate from "../../shared/middlewares/validate.js";
import { loginSchema } from "./auth.schema.js";
import { login } from "./auth.controller.js";

const router = express.Router();

router.post("/login", validate(loginSchema), login);

export default router;