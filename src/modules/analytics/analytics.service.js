import { Op, fn, col, literal } from "sequelize";
import { db } from "../../models/initModels.js";

const { Payroll, AttendanceDaily, LeaveRequest, Employee, Department } = db;

export const getAnalyticsService = async (companyId) => {
  try {
    /* ===============================
       📊 Monthly Payroll Trend
    =============================== */
    const payrollTrend = await Payroll.findAll({
      attributes: [
        "month",
        [fn("SUM", col("netSalary")), "totalSalary"],
      ],
      where: companyId ? { companyId } : {},
      group: ["month"],
      order: [["month", "ASC"]],
      raw: true,
    });

    /* ===============================
       📅 Attendance Summary (Current Month)
    =============================== */
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const attendanceSummary = await AttendanceDaily.findAll({
      attributes: [
        "status",
        [fn("COUNT", col("id")), "count"],
      ],
      where: {
        ...(companyId ? { companyId } : {}),
        date: {
          [Op.between]: [
            startOfMonth.toISOString().slice(0, 10),
            endOfMonth.toISOString().slice(0, 10)
          ]
        },
      },
      group: ["status"],
      raw: true,
    });

    /* ===============================
       🏖 Leave Status Breakdown
    ============================== */
    const leaveBreakdown = await LeaveRequest.findAll({
      attributes: [
        "status",
        [fn("COUNT", col("id")), "count"],
      ],
      where: companyId ? { companyId } : {},
      group: ["status"],
      raw: true,
    });

    /* ===============================
       🏢 Department Distribution
    =============================== */
    // Using simple findAll and manual aggregation if needed, or fixing the Sequelize include group
    const departmentDistribution = await Employee.findAll({
      attributes: [
        [fn("COUNT", col("Employee.id")), "count"],
      ],
      include: [{
        model: Department,
        as: 'department',
        attributes: ['name'],
        required: false // Include employees even without department
      }],
      where: companyId ? { companyId } : {},
      group: [literal('`department`.`id`'), literal('`department`.`name`')], 
      raw: true,
    }).then(res => res.map(r => ({
      name: r['department.name'] || 'Unassigned',
      count: parseInt(r.count) || 0
    }))).catch(err => {
      console.error('[Analytics Service] Dept Distribution Error:', err);
      return [];
    });

    return {
      payrollTrend: payrollTrend || [],
      attendanceSummary: attendanceSummary || [],
      leaveBreakdown: leaveBreakdown || [],
      departmentDistribution: departmentDistribution || [],
    };
  } catch (error) {
    console.error('❌ Analytics Service Global Error:', error);
    throw error;
  }
};