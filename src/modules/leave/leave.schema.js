import { z } from "zod";

export const createLeaveTypeSchema = z.object({
  leaveName: z.string().min(2),
  maxDaysPerYear: z.number().min(0),
});

export const updateLeaveTypeSchema = z.object({
  leaveName: z.string().min(2).optional(),
  maxDaysPerYear: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const createLeaveRequestSchema = z.object({
  employeeId: z.number(),
  leaveTypeId: z.number(),
  fromDate: z.string(),
  toDate: z.string(),
  reason: z.string().optional(),
});

export const updateLeaveStatusSchema = z.object({
  status: z.enum(["Approved", "Rejected"]),
});