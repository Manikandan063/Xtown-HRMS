import asyncHandler from "../../shared/utils/asyncHandler.js";
import * as attendanceService from "./attendance.service.js";
import { AttendanceLog } from "../../models/attendanceLog.model.js";
import { db } from "../../models/initModels.js";
import {
  manualPunchSchema,
  devicePushSchema,
  manualAttendanceSchema,
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
   BULK MANUAL DAILY ATTENDANCE (ADMIN / HR)
========================================================= */
export const manualAttendance = asyncHandler(async (req, res) => {
  const data = manualAttendanceSchema.parse(req.body);
  const companyId = req.user.companyId;

  // 1. Create IN log if time provided
  if (data.checkInTime) {
    // Expected format checkInTime: "09:00"
    await attendanceService.createAttendanceLog({
      companyId,
      employeeId: data.employeeId,
      punchTime: data.checkInTime,
      punchType: "IN",
      source: "MANUAL",
      reason: data.reason
    });
  }

  // 2. Create OUT log if time provided
  if (data.checkOutTime) {
    await attendanceService.createAttendanceLog({
      companyId,
      employeeId: data.employeeId,
      punchTime: data.checkOutTime,
      punchType: "OUT",
      source: "MANUAL",
      reason: data.reason
    });
  }

  // 3. Recalculate Daily Attendance
  await attendanceService.calculateDailyAttendance(
    companyId,
    data.employeeId,
    data.date,
    data.status
  );

  res.status(200).json({ success: true, message: "Manual attendance record processed" });
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

  const result = await attendanceService.syncZKTecoAttendance(
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
  const summary = await attendanceService.getAttendanceSummary(req.user.companyId, req.user);
  res.status(200).json({
    success: true,
    data: summary,
    message: "Attendance summary fetched successfully"
  });
});

export const getMonthlyReport = asyncHandler(async (req, res) => {
  const { month } = req.query; // Expects "2024-03"
  const now = month ? new Date(month) : new Date();
  
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const result = await attendanceService.getCompanyMonthlyAttendance(
    req.user.companyId,
    monthStart,
    monthEnd,
    req.user,
    req.query
  );

  res.status(200).json({
    success: true,
    ...result,
    message: "Monthly attendance report fetched successfully"
  });
});

/* =========================================================
   UPDATE ATTENDANCE (ADMIN / HR)
========================================================= */
export const updateAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const companyId = req.user.companyId;

  // 1. If times are provided, synchronize manual logs first
  if (data.checkInTime || data.checkOutTime) {
    // Flush existing manual overrides for this specific date and employee
    await AttendanceLog.destroy({
      where: {
        employeeId: data.employeeId,
        companyId,
        source: "MANUAL",
        [Op.and]: [
          db.sequelize.where(
            db.sequelize.fn('DATE', db.sequelize.col('punchTime')),
            '=',
            data.date
          )
        ]
      }
    });

    if (data.checkInTime) {
      await attendanceService.createAttendanceLog({
        companyId,
        employeeId: data.employeeId,
        punchTime: data.checkInTime,
        punchType: "IN",
        source: "MANUAL",
        reason: data.reason || "Administrative Sync"
      });
    }
    if (data.checkOutTime) {
      await attendanceService.createAttendanceLog({
        companyId,
        employeeId: data.employeeId,
        punchTime: data.checkOutTime,
        punchType: "OUT",
        source: "MANUAL",
        reason: data.reason || "Administrative Sync"
      });
    }
  }

  // 2. Update the daily record and trigger recalculation
  const updated = await attendanceService.updateAttendanceDaily(id, data, companyId);
  if (!updated) return res.status(404).json({ message: "Attendance record not found" });

  res.status(200).json({ 
    success: true, 
    data: updated, 
    message: "Attendance synchronized successfully" 
  });
});

/* =========================================================
   DELETE ATTENDANCE (ADMIN / HR)
========================================================= */
export const deleteAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const companyId = req.user.companyId;

  const deleted = await attendanceService.deleteAttendanceDaily(id, companyId);
  if (!deleted) return res.status(404).json({ message: "Record not found" });

  res.status(200).json({ success: true, message: "Attendance node purged" });
});



/* =========================================================
   SELFIE ATTENDANCE (Employee Fallback)
========================================================= */
export const selfiePunch = asyncHandler(async (req, res) => {
  const { latitude, longitude, imageUrl } = req.body;
  const companyId = req.user.companyId;
  const employeeId = req.user.employeeId;

  if (!employeeId) {
    return res.status(400).json({ success: false, message: "User is not linked to an employee record" });
  }

  if (!latitude || !longitude || !imageUrl) {
    return res.status(400).json({ success: false, message: "GPS coordinates and selfie capture are required." });
  }

  const result = await attendanceService.selfiePunch({
    companyId,
    employeeId,
    latitude,
    longitude,
    imageUrl,
  });

  res.status(201).json(result);
});

/* =========================================================
   APPROVE / REJECT LOG (ADMIN / HR)
========================================================= */
export const approveLog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // APPROVED or REJECTED
  const companyId = req.user.companyId;

  const result = await attendanceService.approveAttendanceLog(id, status, companyId);
  res.status(200).json({ success: true, data: result, message: `Presence log ${status.toLowerCase()}.` });
});
/* =========================================================
   PERIODIC LOCATION LOG (EMPLOYEE TRACKING)
========================================================= */
export const logLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;
  const companyId = req.user.companyId;
  const employeeId = req.user.employeeId;

  if (!employeeId) {
    return res.status(400).json({ success: false, message: "User is not linked to an employee" });
  }

  const log = await attendanceService.recordPeriodicLocation({
    companyId,
    employeeId,
    latitude,
    longitude
  });

  res.status(201).json({ success: true, data: log });
});
