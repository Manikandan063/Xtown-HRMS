import express from "express";
import * as attendanceController from "./attendance.controller.js";
import authMiddleware from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";
import { isHR, isHRorMD } from "../../shared/middlewares/designation.js";

const router = express.Router();

router.use(authMiddleware);

// MD can only see summaries and their own attendance
router.get("/summary", allowRoles("Admin", "Super Admin"), isHRorMD, attendanceController.getAttendanceSummary);
router.get("/my-attendance", attendanceController.getMyAttendance);

// HR has full control over punching and syncing
router.post("/manual-punch", allowRoles("Admin"), isHR, attendanceController.manualPunch);
router.post("/self-punch", attendanceController.selfPunch);
router.post("/sync-zk", allowRoles("Admin"), isHR, attendanceController.syncZK);

// Device Pushes (No auth or specific auth)
router.post("/push", attendanceController.devicePush);
router.post("/adms/push", attendanceController.deviceAdmsPush);

export default router;