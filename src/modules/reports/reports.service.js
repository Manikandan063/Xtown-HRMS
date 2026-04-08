import { Op } from "sequelize";
import { db } from "../../models/initModels.js";

const { Employee, AttendanceDaily, LeaveRequest, Payroll } = db;

/* ======================================================
   📊 EMPLOYEE REPORT
====================================================== */
export const getEmployeeReportService = async ({
  companyId,
  departmentId,
  page = 1,
  limit = 10,
}) => {
  const offset = (page - 1) * limit;

  const where = { companyId };

  if (departmentId) {
    where.departmentId = departmentId;
  }

  const { rows, count } = await Employee.findAndCountAll({
    where,
    offset,
    limit,
    order: [["createdAt", "DESC"]],
  });

  return {
    data: rows,
    total: count,
    page,
    limit,
  };
};

/* ======================================================
   📅 ATTENDANCE REPORT
====================================================== */
export const getAttendanceReportService = async ({
  companyId,
  dateFrom,
  dateTo,
  employeeId,
  departmentId,
  page = 1,
  limit = 10,
}) => {
  const offset = (page - 1) * limit;

  const where = { companyId };

  // Date range filter
  if (dateFrom && dateTo) {
    where.date = {
      [Op.between]: [dateFrom, dateTo],
    };
  }

  if (employeeId) {
    where.employeeId = employeeId;
  }

  const { rows, count } = await AttendanceDaily.findAndCountAll({
    where,
    include: [
      {
        model: Employee,
        attributes: ["id", "firstName", "lastName", "departmentId"],
        where: departmentId ? { departmentId } : undefined,
      },
    ],
    offset,
    limit,
    order: [["date", "DESC"]],
  });

  return {
    data: rows,
    total: count,
    page,
    limit,
  };
};

/* ======================================================
   🏖 LEAVE REPORT
====================================================== */
export const getLeaveReportService = async ({
  companyId,
  dateFrom,
  dateTo,
  employeeId,
  departmentId,
  page = 1,
  limit = 10,
}) => {
  const offset = (page - 1) * limit;

  const where = { companyId };

  // Leave date overlap logic
  if (dateFrom && dateTo) {
    where[Op.or] = [
      {
        startDate: { [Op.between]: [dateFrom, dateTo] },
      },
      {
        endDate: { [Op.between]: [dateFrom, dateTo] },
      },
    ];
  }

  if (employeeId) {
    where.employeeId = employeeId;
  }

  const { rows, count } = await LeaveRequest.findAndCountAll({
    where,
    include: [
      {
        model: Employee,
        attributes: ["id", "firstName", "lastName", "departmentId"],
        where: departmentId ? { departmentId } : undefined,
      },
    ],
    offset,
    limit,
    order: [["createdAt", "DESC"]],
  });

  return {
    data: rows,
    total: count,
    page,
    limit,
  };
};

/* ======================================================
   💰 PAYROLL REPORT
====================================================== */
export const getPayrollReportService = async ({
  companyId,
  month,
  employeeId,
  page = 1,
  limit = 10,
}) => {
  const offset = (page - 1) * limit;

  const where = { companyId };

  if (month) {
    where.month = month; // Format: YYYY-MM
  }

  if (employeeId) {
    where.employeeId = employeeId;
  }

  const { rows, count } = await Payroll.findAndCountAll({
    where,
    include: [
      {
        model: Employee,
        attributes: ["id", "firstName", "lastName", "departmentId"],
      },
    ],
    offset,
    limit,
    order: [["createdAt", "DESC"]],
  });

  return {
    data: rows,
    total: count,
    page,
    limit,
  };
};