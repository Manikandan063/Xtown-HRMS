import { db } from "../../models/initModels.js";

const { AttendanceLog, AttendanceDaily, Employee, Shift } = db;
import { Op } from "sequelize";

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
   CALCULATE WORK HOURS (Advanced Pairing)
========================================================= */

const calculateWorkHours = (logs) => {
  let totalMilliseconds = 0;
  let inTime = null;

  for (let log of logs) {
    if (log.punchType === "IN") {
      inTime = new Date(log.punchTime);
    }

    if (log.punchType === "OUT" && inTime) {
      const outTime = new Date(log.punchTime);
      totalMilliseconds += outTime - inTime;
      inTime = null;
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
  date
) => {
  const logs = await AttendanceLog.findAll({
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
    order: [["punchTime", "ASC"]],
  });

  if (!logs.length) return;

  const employee = await Employee.findByPk(employeeId, {
    include: {
      model: Shift,
    },
  });

  if (!employee || !employee.Shift) return;

  const shift = employee.Shift;

  const firstIn = logs.find((l) => l.punchType === "IN");
  const lastOut = [...logs].reverse().find((l) => l.punchType === "OUT");

  const totalHours = calculateWorkHours(logs);

  let status = "ABSENT";
  let lateMinutes = 0;
  let overtimeHours = 0;

  /* ------------------------
     STATUS LOGIC
  ------------------------ */

  if (totalHours >= shift.fullDayHours) {
    status = "PRESENT";
  } else if (totalHours >= shift.halfDayHours) {
    status = "HALF_DAY";
  }

  /* ------------------------
     LATE CALCULATION
  ------------------------ */

  if (firstIn) {
    const shiftStart = new Date(`${date} ${shift.startTime}`);
    const inTime = new Date(firstIn.punchTime);

    if (inTime > shiftStart) {
      const diffMinutes = (inTime - shiftStart) / (1000 * 60);

      if (diffMinutes > shift.graceMinutes) {
        lateMinutes = Math.floor(diffMinutes);
      }
    }
  }

  /* ------------------------
     OVERTIME
  ------------------------ */

  if (totalHours > shift.fullDayHours) {
    overtimeHours = totalHours - shift.fullDayHours;
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
  monthEnd
) => {
  return await AttendanceDaily.findAll({
    where: {
      companyId,
      date: {
        [Op.between]: [monthStart, monthEnd],
      },
    },
    include: [
      {
        model: Employee,
        attributes: ["firstName", "lastName", "employeeCode"],
      },
    ],
    order: [["date", "ASC"]],
  });
};

/* =========================================================
   ATTENDANCE SUMMARY (For MD/HR)
========================================================= */

export const getAttendanceSummary = async (companyId) => {
  const today = new Date().toISOString().split("T")[0];

  const [activeEmployeesCount, presentCount, absentCount, halfDayCount, lateCount] = await Promise.all([
    Employee.count({ where: { companyId, status: "ACTIVE" } }),
    AttendanceDaily.count({ where: { companyId, date: today, status: "PRESENT" } }),
    AttendanceDaily.count({ where: { companyId, date: today, status: "ABSENT" } }),
    AttendanceDaily.count({ where: { companyId, date: today, status: "HALF_DAY" } }),
    AttendanceDaily.count({ 
      where: { 
        companyId, 
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
};