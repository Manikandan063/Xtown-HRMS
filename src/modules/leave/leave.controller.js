import * as leaveService from "./leave.service.js";
import { Employee } from "../../models/initModels.js";
import AppError from "../../shared/utils/appError.js";
import {
  createLeaveTypeSchema,
  createLeaveRequestSchema,
  updateLeaveStatusSchema,
} from "./leave.schema.js";

import asyncHandler from "../../shared/utils/asyncHandler.js";

export const createLeaveType = asyncHandler(async (req, res) => {
  const data = createLeaveTypeSchema.parse(req.body);
  const leave = await leaveService.createLeaveType(
    data,
    req.user.companyId
  );
  res.status(201).json({ success: true, data: leave });
});

export const getLeaveTypes = asyncHandler(async (req, res) => {
  const data = await leaveService.getLeaveTypes(
    req.user.companyId
  );
  res.json({ success: true, data });
});

export const deleteLeaveType = asyncHandler(async (req, res) => {
  await leaveService.deleteLeaveType(req.params.id);
  res.json({ success: true, message: "Leave category removed" });
});

export const createLeaveRequest = asyncHandler(async (req, res) => {
  // 1. Resolve employeeId from body or session
  let employeeId = req.body.employeeId || req.user.employeeId;

  // FALLBACK: If missing, try resolving by email (for Admins who are also Employees)
  if (!employeeId && req.user.email) {
    const employee = await Employee.findOne({ where: { officialEmail: req.user.email } });
    if (employee) employeeId = employee.id;
  }

  if (!employeeId) {
    throw new AppError("System could not resolve your employee identity. Please ensure you have an active Employee Profile linked to your account.", 403);
  }
  
  // 2. Map frontend names to schema names
  const fromDate = req.body.fromDate || req.body.startDate;
  const toDate = req.body.toDate || req.body.endDate;

  const payload = {
    ...req.body,
    employeeId,
    fromDate,
    toDate
  };

  const data = createLeaveRequestSchema.parse(payload);
  const leave = await leaveService.createLeaveRequest(
    data,
    req.user.companyId
  );
  res.status(201).json({ success: true, data: leave });
});

export const getLeaveRequests = asyncHandler(async (req, res) => {
  const { role, companyId, employeeId } = req.user;
  
  let data;
  // If regular user (Employee), only show their own requests
  const isElevated = role?.toLowerCase() === 'admin' || 
                     role?.toLowerCase() === 'hr' || 
                     role?.toLowerCase() === 'super_admin' || 
                     role?.toLowerCase() === 'superadmin';

  try {
    let result;
    if (!isElevated) {
      result = await leaveService.getEmployeeLeaveRequests(employeeId, companyId, req.query);
    } else {
      result = await leaveService.getLeaveRequests(companyId, req.query);
    }
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[LeaveController Error]:', err);
    throw err;
  }
});

export const updateLeaveStatus = asyncHandler(async (req, res) => {
  const { status } = updateLeaveStatusSchema.parse(req.body);
  const leave = await leaveService.updateLeaveStatus(
    req.params.id,
    status,
    req.user.userId
  );
  res.json({ success: true, data: leave });
});

export const viewLeaveRequest = asyncHandler(async (req, res) => {
  await leaveService.markSingleAsViewed(req.params.id, req.user.userId);
  res.json({ success: true, message: "Marked as viewed" });
});