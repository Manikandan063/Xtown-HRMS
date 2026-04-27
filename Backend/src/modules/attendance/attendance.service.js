import { db } from "../../models/initModels.js";
import { connectDevice } from "../../zkDevice/zkConnection.js";
import { getAttendanceLogs } from "../../zkDevice/zkAttendance.js";
import fs from 'fs';
import path from 'path';

const { AttendanceLog, AttendanceDaily, Employee, Shift, ZKUser, Checkpoint, LocationLog } = db;

import { Op } from "sequelize";

/**
 * Calculates the distance between two points in meters using Haversine formula
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/* =========================================================
   SELFIE ATTENDANCE PUNCH (Fallback Method)
========================================================= */

export const selfiePunch = async ({
  companyId,
  employeeId,
  latitude,
  longitude,
  imageUrl,
}) => {
  // 1. Fetch checkpoints for the company
  const checkpoints = await Checkpoint.findAll({
    where: { companyId, isActive: true },
  });

  if (!checkpoints.length) {
    throw new Error("No attendance checkpoints configured for your organization. Contact HR.");
  }

  // 2. Find nearest checkpoint and check radius
  let nearestCheckpoint = null;
  let minDistance = Infinity;
  let locationStatus = "OUTSIDE";
  let approvalStatus = "PENDING";

  for (const cp of checkpoints) {
    const distance = calculateDistance(latitude, longitude, cp.latitude, cp.longitude);
    if (distance < minDistance) {
      minDistance = distance;
      nearestCheckpoint = cp;
    }
  }

  if (nearestCheckpoint && minDistance <= nearestCheckpoint.radius) {
    locationStatus = "VALID";
    approvalStatus = "AUTO";
  }

  // 3. Prevent duplicate for the day
  const today = new Date().toISOString().split("T")[0];
  const existing = await AttendanceLog.findOne({
    where: {
      employeeId,
      companyId,
      punchTime: {
        [Op.between]: [
          new Date(`${today} 00:00:00`),
          new Date(`${today} 23:59:59`),
        ],
      },
      method: "Selfie"
    }
  });

  // Decide punchType (IN by default for first, OUT for second)
  let punchType = "IN";
  if (existing) {
     punchType = "OUT";
     // Check if they already have both IN and OUT for selfie
     const count = await AttendanceLog.count({
        where: {
          employeeId,
          companyId,
          punchTime: {
            [Op.between]: [
              new Date(`${today} 00:00:00`),
              new Date(`${today} 23:59:59`),
            ],
          },
          method: "Selfie"
        }
     });
     if (count >= 2) throw new Error("Selfie attendance limit reached for today.");
  }

  // 4. Save Image to Filesystem (naming with employee ID for verification)
  let finalImageUrl = imageUrl;
  if (imageUrl && imageUrl.startsWith('data:image')) {
    try {
      const uploadPath = 'uploads/attendance';
      if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
      
      const employee = await Employee.findByPk(employeeId);
      const empCode = employee?.employeeCode || 'EMP';
      const fileName = `selfie_${empCode}_${Date.now()}.jpg`;
      const filePath = path.join(uploadPath, fileName);
      
      const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
      fs.writeFileSync(filePath, base64Data, 'base64');
      
      finalImageUrl = `/uploads/attendance/${fileName}`;
    } catch (err) {
      console.error("Failed to save selfie image file:", err.message);
      // Fallback to saving base64 in DB if file write fails
    }
  }

  // 5. Create Attendance Log
  const log = await AttendanceLog.create({
    companyId,
    employeeId,
    punchTime: new Date(),
    punchType,
    source: "MANUAL",
    method: "Selfie",
    latitude,
    longitude,
    imageUrl: finalImageUrl,
    checkpointId: nearestCheckpoint?.id,
    locationStatus,
    approvalStatus,
  });

  // 5. Trigger Daily Calculation (if valid or approved)
  if (approvalStatus === "AUTO") {
    await calculateDailyAttendance(companyId, employeeId, today);
  }

  return {
    success: true,
    data: log,
    message: locationStatus === "VALID" 
      ? "Attendance marked successfully (Geo-Verified)." 
      : "You are outside the designated zone. Attendance submitted for HR approval.",
    locationStatus
  };
};

/* =========================================================
   PERIODIC LOCATION TRACKING
========================================================= */

export const recordPeriodicLocation = async ({
  companyId,
  employeeId,
  latitude,
  longitude
}) => {
  // 1. Fetch checkpoints for the company
  const checkpoints = await Checkpoint.findAll({
    where: { companyId, isActive: true },
  });

  if (!checkpoints.length) return null;

  // 2. Find nearest checkpoint
  let nearestCheckpoint = null;
  let minDistance = Infinity;

  for (const cp of checkpoints) {
    const distance = calculateDistance(latitude, longitude, cp.latitude, cp.longitude);
    if (distance < minDistance) {
      minDistance = distance;
      nearestCheckpoint = cp;
    }
  }

  const status = (nearestCheckpoint && minDistance <= nearestCheckpoint.radius) ? "INSIDE" : "OUTSIDE";

  // 3. Create Location Log
  return await LocationLog.create({
    companyId,
    employeeId,
    latitude,
    longitude,
    status,
    distance: minDistance,
    timestamp: new Date()
  });
};


/* =========================================================
   CREATE ATTENDANCE LOG (Manual or Device)
========================================================= */

export const createAttendanceLog = async ({
  companyId,
  employeeId,
  punchTime,
  punchType,
  deviceId,
  source,
  reason,
  location,
}) => {
  return await AttendanceLog.create({
    companyId,
    employeeId,
    punchTime,
    punchType,
    deviceId,
    source,
    reason,
    location,
  });
};

/* =========================================================
   FIND EMPLOYEE BY DEVICE CODE
========================================================= */

export const findEmployeeByCode = async (employeeCode, companyId) => {
  return await Employee.findOne({
    where: { employeeCode, companyId },
  });
};

/* =========================================================
   SYNC ATTENDANCE FROM ZKTECO DEVICE
========================================================= */

export const syncZKTecoAttendance = async (ip, port = 4370, companyId) => {
  let device;
  try {
    // 1. Connection
    device = await connectDevice(ip, port);
    
    // 2. Fetch attendance logs
    const logs = await getAttendanceLogs(device);
    
    if (!logs || logs.length === 0) {
      console.log(`ℹ No logs found on device at ${ip}:${port}`);
      return { success: true, count: 0, message: "No logs found" };
    }

    let syncCount = 0;
    let skippedCount = 0;

    // 3. Process logs
    const syncedPairs = new Set();

    for (const log of logs) {
      const { deviceUserId, recordTime } = log;
      const punchTime = new Date(recordTime);
      const punchDate = recordTime.split(" ")[0]; // YYYY-MM-DD

      // A. Map mapping device_user_id -> employee
      const mapping = await ZKUser.findOne({
        where: {
          deviceUserId: deviceUserId,
          companyId: companyId
        }
      });

      if (!mapping) {
        skippedCount++;
        continue;
      }

      // B. Prevent duplicates
      const existing = await AttendanceLog.findOne({
        where: {
          employeeId: mapping.employeeId,
          companyId: companyId,
          punchTime: punchTime
        }
      });

      if (existing) continue;

      // C. Insert into Attendance table
      await AttendanceLog.create({
        employeeId: mapping.employeeId,
        companyId: companyId,
        punchTime: punchTime,
        punchType: "IN", // Standard ZK logs are usually IN or toggled, we default to IN and let the engine pair them
        source: "DEVICE",
        method: "face",
        deviceUserId: deviceUserId
      });

      syncCount++;
      syncedPairs.add(`${mapping.employeeId}|${punchDate}`);
    }

    // 4. Trigger Daily Calculation for all updated employees/dates
    for (const pair of syncedPairs) {
      const [employeeId, date] = pair.split("|");
      try {
        await calculateDailyAttendance(companyId, employeeId, date);
      } catch (err) {
        console.error(`❌ Recalculation failed for ${employeeId} on ${date}:`, err.message);
      }
    }

    // 5. Disconnect safely
    await device.disconnect().catch(() => {});


    return { 
      success: true, 
      count: syncCount, 
      skipped: skippedCount,
      message: `${syncCount} records synced, ${skippedCount} skipped (no mapping).` 
    };

  } catch (error) {
    console.error("❌ ZK Sync Service Error:", error.message);
    if (device) await device.disconnect().catch(() => {});
    throw error;
  }
};

/* =========================================================
   CALCULATE WORK HOURS (Advanced Pairing)
========================================================= */

const calculateWorkHours = (logs) => {
  if (!logs || logs.length < 2) return 0;
  
  let totalMilliseconds = 0;
  let inTime = null;

  // Ensure logs are sorted by punchTime
  const sortedLogs = [...logs].sort((a, b) => new Date(a.punchTime) - new Date(b.punchTime));

  for (let log of sortedLogs) {
    if (log.punchType === "IN") {
      // If we already have an IN, and this is another IN, we keep the earlier one 
      // (or we could keep the later one, but keeping the first IN of a session is standard)
      if (inTime === null) {
        inTime = new Date(log.punchTime);
      }
    } else if (log.punchType === "OUT") {
      if (inTime) {
        const outTime = new Date(log.punchTime);
        if (outTime > inTime) {
          totalMilliseconds += outTime - inTime;
        }
        inTime = null; // Reset for next pair
      }
    }
  }

  return totalMilliseconds / (1000 * 60 * 60);
};

/* =========================================================
   ADVANCED DAILY ATTENDANCE ENGINE
========================================================= */

export const calculateDailyAttendance = async (
  companyId,
  employeeId,
  date,
  manualStatus = null
) => {
  const logs = await AttendanceLog.findAll({
    where: {
      companyId,
      employeeId,
      [Op.and]: [
        db.sequelize.where(
          db.sequelize.fn('DATE', db.sequelize.col('punchTime')),
          '=',
          date
        )
      ]
    },
    order: [["punchTime", "ASC"]],
  });

  if (!logs.length) return;

  const employee = await Employee.findByPk(employeeId, {
    include: [{ model: Shift }, { model: db.Company, as: 'company' }],
  });

  if (!employee) return;

  // Fallback to Company timings if Shift is not assigned
  const effectiveShift = employee.Shift || {
    startTime: employee.company?.workingStartTime || "09:30",
    endTime: employee.company?.workingEndTime || "17:30",
    fullDayHours: 8,
    halfDayHours: 4,
    graceMinutes: 15
  };


  // 🔹 Prioritize Manual Overrides for First In / Last Out
  let firstIn = logs.find(l => l.punchType === "IN" && l.source === "MANUAL");
  if (!firstIn) firstIn = logs.find(l => l.punchType === "IN");

  let lastOut = [...logs].reverse().find(l => l.punchType === "OUT" && l.source === "MANUAL");
  if (!lastOut) lastOut = [...logs].reverse().find(l => l.punchType === "OUT");

  // If we have an IN but no OUT, and it's not today, we might want to look for an OUT 
  // But for now, we just calculate based on available logs
  const totalHours = calculateWorkHours(logs);

  let status = "ABSENT";
  let lateMinutes = 0;
  let overtimeHours = 0;

  /* ------------------------
     LEAVE STATUS CHECK
  ------------------------ */
  const { LeaveRequest } = db;
  const leave = await LeaveRequest.findOne({
    where: {
      employeeId,
      status: "APPROVED",
      fromDate: { [Op.lte]: date },
      toDate: { [Op.gte]: date }
    }
  });

  if (manualStatus) {
    status = manualStatus;
  } else if (leave) {
    status = "LEAVE";
  } else if (totalHours >= (effectiveShift.fullDayHours || 8)) {
    status = "PRESENT";
  } else if (totalHours >= (effectiveShift.halfDayHours || 4)) {
    status = "HALF_DAY";
  }

  /* ------------------------
     LATE CALCULATION
  ------------------------ */

  if (firstIn) {
    const shiftStart = new Date(`${date} ${effectiveShift.startTime}`);
    const inTime = new Date(firstIn.punchTime);

    if (inTime > shiftStart) {
      const diffMinutes = (inTime - shiftStart) / (1000 * 60);

      if (diffMinutes > effectiveShift.graceMinutes) {
        lateMinutes = Math.floor(diffMinutes);
      }
    }
  }

  /* ------------------------
     OVERTIME
  ------------------------ */

  if (totalHours > effectiveShift.fullDayHours) {
    overtimeHours = totalHours - effectiveShift.fullDayHours;
  }

  /* ------------------------
     LOCATION LOG EVALUATION
  ------------------------ */
  const locationLogs = await LocationLog.findAll({
    where: {
      companyId,
      employeeId,
      timestamp: {
        [Op.between]: [
          new Date(`${date} 00:00:00`),
          new Date(`${date} 23:59:59`),
        ],
      },
    }
  });

  if (locationLogs.length > 0) {
    const outsideLogs = locationLogs.filter(l => l.status === "OUTSIDE").length;
    const outsideRatio = outsideLogs / locationLogs.length;

    // Strict evaluation based on location persistence
    if (outsideRatio > 0.7) {
      status = "ABSENT"; // Mostly outside
    } else if (outsideRatio > 0.3) {
      status = "HALF_DAY"; // Frequently outside
    }
  }


  /* ------------------------
     UPSERT DAILY RECORD
  ------------------------ */

  await AttendanceDaily.upsert({
    companyId,
    employeeId,
    date,
    firstIn: firstIn?.punchTime || null,
    lastOut: lastOut?.punchTime || null,
    totalHours,
    status,
    lateMinutes,
    overtimeHours,
  });
};

/* =========================================================
   EMPLOYEE ATTENDANCE VIEW
========================================================= */

export const getEmployeeAttendance = async (
  companyId,
  employeeId,
  startDate,
  endDate
) => {
  return await AttendanceDaily.findAll({
    where: {
      companyId,
      employeeId,
      date: {
        [Op.between]: [startDate, endDate],
      },
    },
    order: [["date", "DESC"]],
  });
};

/* =========================================================
   COMPANY MONTHLY REPORT
========================================================= */

export const getCompanyMonthlyAttendance = async (
  companyId,
  monthStart,
  monthEnd,
  user = null,
  query = {}
) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const offset = (page - 1) * limit;
  const search = query.search || "";

  const filter = {
    companyId,
    date: {
      [Op.between]: [query.startDate || monthStart, query.endDate || monthEnd],
    },
  };

  if (query.status && query.status !== 'ALL') {
    filter.status = query.status;
  }

  const rawRole = String(user?.role || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const isEmployee = rawRole === "user" || rawRole === "employee";

  // If employee, only show their own logs
  if (isEmployee && user.employeeId) {
    filter.employeeId = user.employeeId;
  }

  const employeeIncludeFilter = {};
  if (search) {
    employeeIncludeFilter[Op.or] = [
      { firstName: { [Op.iLike]: `%${search}%` } },
      { lastName: { [Op.iLike]: `%${search}%` } },
      { employeeCode: { [Op.iLike]: `%${search}%` } }
    ];
  }

  const { rows, count } = await AttendanceDaily.findAndCountAll({
    where: filter,
    limit,
    offset,
    distinct: true,
    include: [
      {
        model: Employee,
        attributes: ["firstName", "lastName", "employeeCode"],
        where: search ? employeeIncludeFilter : undefined
      },
      {
        model: AttendanceLog,
        as: "AttendanceLogs",
        attributes: ["id", "punchType", "method", "latitude", "longitude", "imageUrl", "locationStatus", "approvalStatus"],
        on: {
          employeeId: { [Op.col]: 'AttendanceDaily.employeeId' },
          companyId: { [Op.col]: 'AttendanceDaily.companyId' },
          [Op.and]: [
            db.sequelize.where(
              db.sequelize.fn('DATE', db.sequelize.col('AttendanceLogs.punchTime')),
              '=',
              db.sequelize.col('AttendanceDaily.date')
            )
          ]
        },
        required: false
      }
    ],
    order: [["date", "DESC"]],
  });

  return {
    total: count,
    page,
    limit,
    data: rows
  };
};

/* =========================================================
   UPDATE ATTENDANCE DAILY (ADMIN / HR)
========================================================= */

export const updateAttendanceDaily = async (id, data, companyId) => {
  const record = await AttendanceDaily.findOne({
    where: { id, companyId }
  });
  if (!record) return null;

  // Manually update record or recalculate if times changed
  await record.update(data);
  
  // Recalculate to ensure totalHours etc are correct
  // We pass data.status as manualStatus override
  await calculateDailyAttendance(companyId, record.employeeId, data.date || record.date, data.status);
  
  // Return the refreshed record
  return await AttendanceDaily.findOne({
    where: { id, companyId },
    include: [{ model: Employee, attributes: ["firstName", "lastName", "employeeCode"] }]
  });
};



/* =========================================================
   DELETE ATTENDANCE DAILY (ADMIN / HR)
========================================================= */

export const deleteAttendanceDaily = async (id, companyId) => {
  const record = await AttendanceDaily.findOne({
    where: { id, companyId }
  });
  if (!record) return null;

  await record.destroy();
  return true;
};

/* =========================================================
   ATTENDANCE SUMMARY (For MD/HR/Employee)
========================================================= */

export const getAttendanceSummary = async (companyId, user = null) => {
  const today = new Date().toISOString().split("T")[0];
  
  const rawRole = String(user?.role || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const isSuperAdmin = rawRole === "superadmin" || !companyId; 
  const isEmployee = rawRole === "user" || rawRole === "employee";

  // --- 1. Admin/SuperAdmin Global Summary ---
  if (!isEmployee) {
    const filter = {};
    if (!isSuperAdmin) {
      filter.companyId = companyId;
    }

    const [activeEmployeesCount, presentCount, absentCount, halfDayCount, lateCount] = await Promise.all([
      Employee.count({ where: { ...filter, status: "ACTIVE" } }),
      AttendanceDaily.count({ where: { ...filter, date: today, status: "PRESENT" } }),
      AttendanceDaily.count({ where: { ...filter, date: today, status: "ABSENT" } }),
      AttendanceDaily.count({ where: { ...filter, date: today, status: "HALF_DAY" } }),
      AttendanceDaily.count({ 
        where: { 
          ...filter, 
          date: today, 
          lateMinutes: { [Op.gt]: 0 } 
        } 
      })
    ]);

    return {
      date: today,
      totalEmployees: activeEmployeesCount,
      present: presentCount,
      absent: absentCount,
      halfDay: halfDayCount,
      lateCount,
    };
  }

  // --- 2. Employee Personal Summary ---
  // Returns stats for the CURRENT MONTH for the employee
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  
  const [presentDays, lateDays, totalWorkHours] = await Promise.all([
    AttendanceDaily.count({ where: { employeeId: user.employeeId, status: "PRESENT", date: { [Op.gte]: monthStart } } }),
    AttendanceDaily.count({ where: { employeeId: user.employeeId, lateMinutes: { [Op.gt]: 0 }, date: { [Op.gte]: monthStart } } }),
    AttendanceDaily.sum('totalHours', { where: { employeeId: user.employeeId, date: { [Op.gte]: monthStart } } })
  ]);

  return {
    date: today,
    present: presentDays,
    lateCount: lateDays,
    totalHours: totalWorkHours || 0,
    totalEmployees: 1 // For UI consistency
  };
};

/* =========================================================
   APPROVE / REJECT ATTENDANCE LOG (ADMIN / HR)
========================================================= */
export const approveAttendanceLog = async (id, status, companyId) => {
  const log = await AttendanceLog.findOne({
    where: { id, companyId }
  });

  if (!log) throw new Error("Attendance log not found.");

  await log.update({ approvalStatus: status });

  // If approved, recalculate daily attendance for that date
  if (status === "APPROVED") {
    const date = log.punchTime.toISOString().split("T")[0];
    await calculateDailyAttendance(companyId, log.employeeId, date);
  }

  return log;
};