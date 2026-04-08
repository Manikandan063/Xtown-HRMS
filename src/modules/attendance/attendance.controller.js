import asyncHandler from "../../shared/asyncHandler.js";
import * as attendanceService from "./attendance.service.js";
import { AttendanceLog } from "../../models/attendanceLog.model.js";
import {
  manualPunchSchema,
  devicePushSchema,
} from "./attendance.schema.js";
import { Op } from "sequelize";

/* =========================================================
   MANUAL PUNCH (ADMIN / HR)
========================================================= */
export const manualPunch = asyncHandler(async (req, res) => {
  const data = manualPunchSchema.parse(req.body);

  const log = await attendanceService.createAttendanceLog({
    companyId: req.user.companyId,
    employeeId: data.employeeId,
    punchTime: data.punchTime,
    punchType: data.punchType,
    deviceId: null,
    source: "MANUAL",
  });

  const date = data.punchTime.split("T")[0];

  await attendanceService.calculateDailyAttendance(
    req.user.companyId,
    data.employeeId,
    date
  );

  res.status(201).json({ success: true, data: log });
});

/* =========================================================
   DEVICE PUSH (JSON FORMAT - OPTIONAL API)
========================================================= */
export const devicePush = asyncHandler(async (req, res) => {
  const data = devicePushSchema.parse(req.body);

  const employee = await attendanceService.findEmployeeByCode(
    data.employeeCode,
    req.body.companyId
  );

  if (!employee)
    return res.status(404).json({ message: "Employee not found" });

  await attendanceService.createAttendanceLog({
    companyId: employee.companyId,
    employeeId: employee.id,
    punchTime: data.punchTime,
    punchType: data.punchType,
    deviceId: data.deviceId,
    source: "DEVICE",
  });

  const date = data.punchTime.split("T")[0];

  await attendanceService.calculateDailyAttendance(
    employee.companyId,
    employee.id,
    date
  );

  res.status(200).json({ success: true });
});

/* =========================================================
   ZKTECO ADMS PUSH (RAW FORMAT SUPPORT)
========================================================= */
export const deviceAdmsPush = asyncHandler(async (req, res) => {
  const data = req.body;

  console.log("📡 ZKTeco RAW DATA:", data);

  // If no punch data, just respond OK (handshake request)
  if (!data.UserID || !data.RecordTime) {
    return res.status(200).send("OK");
  }

  // 1️⃣ Find employee using UserID as employeeCode
  const employee = await attendanceService.findEmployeeByCode(
    data.UserID,
    1 // ⚠ For now single company (we upgrade later)
  );

  if (!employee) {
    console.log("❌ Employee not found for UserID:", data.UserID);
    return res.status(200).send("OK");
  }

  // 2️⃣ Convert Date Format
  const punchTime = new Date(data.RecordTime).toISOString();
  const date = punchTime.split("T")[0];

  // 3️⃣ Auto Detect IN / OUT
  const lastLog = await AttendanceLog.findOne({
    where: {
      companyId: employee.companyId,
      employeeId: employee.id,
    },
    order: [["punchTime", "DESC"]],
  });

  let punchType = "IN";

  if (lastLog && lastLog.punchType === "IN") {
    punchType = "OUT";
  }

  // 4️⃣ Create Attendance Log
  await attendanceService.createAttendanceLog({
    companyId: employee.companyId,
    employeeId: employee.id,
    punchTime,
    punchType,
    deviceId: data.SN || "ZKTeco",
    source: "DEVICE",
  });

  // 5️⃣ Recalculate Daily Attendance
  await attendanceService.calculateDailyAttendance(
    employee.companyId,
    employee.id,
    date
  );

  res.status(200).send("OK"); // REQUIRED by ZKTeco
});

/* =========================================================
   GET MY ATTENDANCE
========================================================= */
export const getMyAttendance = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const data = await attendanceService.getEmployeeAttendance(
    req.user.companyId,
    req.user.employeeId,
    startDate,
    endDate
  );

  res.status(200).json({
    success: true,
    count: data.length,
    data,
  });
});

/* =========================================================
   SELF PUNCH (CLOCK IN / CLOCK OUT FOR USER)
========================================================= */
export const selfPunch = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;
  const employeeId = req.user.employeeId;

  if (!employeeId) {
    return res.status(400).json({ success: false, message: "User is not linked to an employee record" });
  }

  // 1. Get current time
  const now = new Date();
  const punchTime = now.toISOString();
  const date = punchTime.split("T")[0];

  // 2. Auto Detect IN / OUT
  const lastLog = await AttendanceLog.findOne({
    where: {
      companyId,
      employeeId,
      punchTime: {
        [Op.between]: [
          new Date(`${date} 00:00:00`),
          new Date(`${date} 23:59:59`),
        ],
      },
    },
    order: [["punchTime", "DESC"]],
  });

  let punchType = "IN";
  if (lastLog && lastLog.punchType === "IN") {
    punchType = "OUT";
  }

  // 3. Create Log
  const log = await attendanceService.createAttendanceLog({
    companyId,
    employeeId,
    punchTime,
    punchType,
    deviceId: "WEB_PORTAL",
    source: "MANUAL",
  });

  // 4. Recalculate Daily
  await attendanceService.calculateDailyAttendance(companyId, employeeId, date);

  res.status(201).json({ 
    success: true, 
    message: `Successfully punched ${punchType}`,
    data: log 
  });
});

/* =========================================================
   SYNC ATTENDANCE FROM ZK DEVICE (IP/PORT)
========================================================= */
export const syncZK = asyncHandler(async (req, res) => {
  const { ip, port } = req.body;
  const companyId = req.user.companyId;

  if (!ip) {
    return res
      .status(400)
      .json({ success: false, message: "IP address is required" });
  }

  // Import service here or at the top
  const zkSyncService = await import("./services/zkSync.service.js");
  
  const result = await zkSyncService.syncZKTecoAttendance(
    ip,
    port || 4370,
    companyId
  );

  res.status(200).json(result);
});

/* =========================================================
   ATTENDANCE SUMMARY (MD / HR)
========================================================= */
export const getAttendanceSummary = asyncHandler(async (req, res) => {
  const summary = await attendanceService.getAttendanceSummary(req.user.companyId);
  res.status(200).json({
    success: true,
    data: summary,
    message: "Attendance summary fetched successfully"
  });
});
