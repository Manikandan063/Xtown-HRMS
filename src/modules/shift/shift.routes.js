import express from "express";
import * as shiftController from "./shift.controller.js";
import { checkRole } from "../../shared/middlewares/role.js";
import authMiddleware from "../../shared/middlewares/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/create", checkRole("SUPER_ADMIN", "ADMIN"), shiftController.createShift);
router.post("/assign/:employeeId", checkRole("SUPER_ADMIN", "ADMIN"), shiftController.assignShift);
router.get("/", checkRole("SUPER_ADMIN", "ADMIN", "USER"), shiftController.getShifts);

export default router;
