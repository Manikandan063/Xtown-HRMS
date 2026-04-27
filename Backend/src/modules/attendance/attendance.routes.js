import express from "express";
import * as attendanceController from "./attendance.controller.js";
import authMiddleware from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";
import { isHR, isHRorMD } from "../../shared/middlewares/designation.js";

const router = express.Router();

router.use(authMiddleware);

// MD can only see summaries and their own attendance
router.get("/summary", attendanceController.getAttendanceSummary);
router.get("/my-attendance", attendanceController.getMyAttendance);

// HR has full control over punching and syncing
router.post("/manual-punch", allowRoles("Admin", "Super Admin"), isHR, attendanceController.manualPunch);
router.post("/manual-attendance", allowRoles("Admin", "Super Admin"), isHR, attendanceController.manualAttendance);
router.post("/self-punch", attendanceController.selfPunch);
router.post("/selfie-punch", attendanceController.selfiePunch);
router.post("/location-log", attendanceController.logLocation);
router.post("/sync-zk", allowRoles("Admin", "Super Admin"), isHR, attendanceController.syncZK);


router.get("/report", attendanceController.getMonthlyReport);
router.put("/logs/:id/approval", allowRoles("Admin", "Super Admin"), isHR, attendanceController.approveLog);

// CRUD
router.put("/:id", allowRoles("Admin", "Super Admin"), isHR, attendanceController.updateAttendance);
router.delete("/:id", allowRoles("Admin", "Super Admin"), isHR, attendanceController.deleteAttendance);

// Device Pushes (No auth or specific auth)
router.post("/push", attendanceController.devicePush);
router.post("/adms/push", attendanceController.deviceAdmsPush);

export default router;