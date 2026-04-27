import asyncHandler from "../../shared/utils/asyncHandler.js";
import {
  getEmployeeReportService,
  getAttendanceReportService,
  getLeaveReportService,
  getPayrollReportService,
} from "./reports.service.js";

/* ======================================================
   📊 EMPLOYEE REPORT
====================================================== */
export const getEmployeeReport = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;

  const { departmentId, page = 1, limit = 10 } = req.query;

  const result = await getEmployeeReportService({
    companyId,
    departmentId,
    page: Number(page),
    limit: Number(limit),
  });

  res.status(200).json({
    success: true,
    message: "Employee report fetched successfully",
    ...result,
  });
});

/* ======================================================
   📅 ATTENDANCE REPORT
====================================================== */
export const getAttendanceReport = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;

  const {
    dateFrom,
    dateTo,
    employeeId,
    departmentId,
    page = 1,
    limit = 10,
  } = req.query;

  const result = await getAttendanceReportService({
    companyId,
    dateFrom,
    dateTo,
    employeeId,
    departmentId,
    page: Number(page),
    limit: Number(limit),
  });

  res.status(200).json({
    success: true,
    message: "Attendance report fetched successfully",
    ...result,
  });
});

/* ======================================================
   🏖 LEAVE REPORT
====================================================== */
export const getLeaveReport = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;

  const {
    dateFrom,
    dateTo,
    employeeId,
    departmentId,
    page = 1,
    limit = 10,
  } = req.query;

  const result = await getLeaveReportService({
    companyId,
    dateFrom,
    dateTo,
    employeeId,
    departmentId,
    page: Number(page),
    limit: Number(limit),
  });

  res.status(200).json({
    success: true,
    message: "Leave report fetched successfully",
    ...result,
  });
});

/* ======================================================
   💰 PAYROLL REPORT
====================================================== */
export const getPayrollReport = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;

  const { month, employeeId, page = 1, limit = 10 } = req.query;

  const result = await getPayrollReportService({
    companyId,
    month,
    employeeId,
    page: Number(page),
    limit: Number(limit),
  });

  res.status(200).json({
    success: true,
    message: "Payroll report fetched successfully",
    ...result,
  });
});