import * as leaveService from "./leave.service.js";
import {
  createLeaveTypeSchema,
  createLeaveRequestSchema,
  updateLeaveStatusSchema,
} from "./leave.schema.js";

import asyncHandler from "../../shared/asyncHandler.js";

export const createLeaveType = asyncHandler(async (req, res) => {
  const data = createLeaveTypeSchema.parse(req.body);
  const leave = await leaveService.createLeaveType(
    data,
    req.user.companyId
  );
  res.status(201).json(leave);
});

export const getLeaveTypes = asyncHandler(async (req, res) => {
  const data = await leaveService.getLeaveTypes(
    req.user.companyId
  );
  res.json(data);
});

export const createLeaveRequest = asyncHandler(async (req, res) => {
  const data = createLeaveRequestSchema.parse(req.body);
  const leave = await leaveService.createLeaveRequest(
    data,
    req.user.companyId
  );
  res.status(201).json(leave);
});

export const getLeaveRequests = asyncHandler(async (req, res) => {
  const data = await leaveService.getLeaveRequests(
    req.user.companyId
  );
  res.json(data);
});

export const updateLeaveStatus = asyncHandler(async (req, res) => {
  const { status } = updateLeaveStatusSchema.parse(req.body);
  const leave = await leaveService.updateLeaveStatus(
    req.params.id,
    status,
    req.user.id
  );
  res.json(leave);
});