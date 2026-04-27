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
  employeeId: z.union([z.string(), z.number()], { required_error: "Employee context is missing" }),
  leaveTypeId: z.union([z.string(), z.number()], { required_error: "Please select a leave category" }),
  fromDate: z.string({ required_error: "Start date is required" }).min(1, "Start date is required"),
  toDate: z.string({ required_error: "End date is required" }).min(1, "End date is required"),
  reason: z.string().min(1, "Reason for leave is required"),
});

export const updateLeaveStatusSchema = z.object({
  status: z.enum(["Approved", "Rejected"]),
});