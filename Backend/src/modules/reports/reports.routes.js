import express from "express";
import {
  getEmployeeReport,
  getAttendanceReport,
  getLeaveReport,
  getPayrollReport,
} from "./reports.controller.js";

import authMiddleware from "../../shared/middlewares/auth.js";
import { allowRoles as roleMiddleware } from "../../shared/middlewares/role.js";
import validate from "../../shared/middlewares/validate.js";

import {
  dateRangeSchema,
  payrollReportSchema,
} from "./reports.schema.js";

const router = express.Router();

/* ======================================================
   🔐 Common Middlewares
   - Must be authenticated
   - Only Admin / Super Admin
====================================================== */
router.use(authMiddleware);
router.use(roleMiddleware("Super Admin", "Admin", "User"));

/* ======================================================
   📊 EMPLOYEE REPORT
   GET /api/reports/employees
====================================================== */
router.get(
  "/employees",
  getEmployeeReport
);

/* ======================================================
   📅 ATTENDANCE REPORT
   GET /api/reports/attendance
====================================================== */
router.get(
  "/attendance",
  validate(dateRangeSchema),
  getAttendanceReport
);

/* ======================================================
   🏖 LEAVE REPORT
   GET /api/reports/leaves
====================================================== */
router.get(
  "/leaves",
  validate(dateRangeSchema),
  getLeaveReport
);

/* ======================================================
   💰 PAYROLL REPORT
   GET /api/reports/payroll
====================================================== */
router.get(
  "/payroll",
  validate(payrollReportSchema),
  getPayrollReport
);

export default router;