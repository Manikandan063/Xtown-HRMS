import { Op, fn, col, literal } from "sequelize";
import { db } from "../../models/initModels.js";

const { Payroll, AttendanceDaily, LeaveRequest, Employee } = db;

export const getAnalyticsService = async (companyId) => {
  /* ===============================
     📊 Monthly Payroll Trend
  =============================== */

  const payrollTrend = await Payroll.findAll({
    attributes: [
      "month",
      [fn("SUM", col("netSalary")), "totalSalary"],
    ],
    where: { companyId },
    group: ["month"],
    order: [["month", "ASC"]],
    raw: true,
  });

  /* ===============================
     📅 Attendance Summary (Current Month)
  =============================== */

  const currentMonth = new Date().toISOString().slice(0, 7);

  const attendanceSummary = await AttendanceDaily.findAll({
    attributes: [
      "status",
      [fn("COUNT", col("id")), "count"],
    ],
    where: {
      companyId,
      date: { [Op.like]: `${currentMonth}%` },
    },
    group: ["status"],
    raw: true,
  });

  /* ===============================
     🏖 Leave Status Breakdown
  =============================== */

  const leaveBreakdown = await LeaveRequest.findAll({
    attributes: [
      "status",
      [fn("COUNT", col("id")), "count"],
    ],
    where: { companyId },
    group: ["status"],
    raw: true,
  });

  /* ===============================
     🏢 Department Distribution
  =============================== */

  const departmentDistribution = await Employee.findAll({
    attributes: [
      "departmentId",
      [fn("COUNT", col("id")), "count"],
    ],
    where: { companyId },
    group: ["departmentId"],
    raw: true,
  });

  return {
    payrollTrend,
    attendanceSummary,
    leaveBreakdown,
    departmentDistribution,
  };
};