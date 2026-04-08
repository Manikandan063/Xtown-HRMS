import express from "express";
import * as documentController from "./document.controller.js";
import { checkRole } from "../../shared/middlewares/role.js";
import authMiddleware from "../../shared/middlewares/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/upload", checkRole("SUPER_ADMIN", "ADMIN"), documentController.uploadDocument);
router.get("/employee/:employeeId", checkRole("SUPER_ADMIN", "ADMIN", "USER"), documentController.getEmployeeDocs);

export default router;
