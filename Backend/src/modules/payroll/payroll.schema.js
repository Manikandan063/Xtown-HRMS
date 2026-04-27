// modules/payroll/payroll.schema.js

import { z } from "zod";

export const createPayrollSchema = z.object({
  employeeId: z.string().uuid(),
  month: z.string(),
  overtimeHours: z.coerce.number().optional(),
  overtimeRate: z.coerce.number().optional(),
});

export const createBatchPayrollSchema = z.object({
  month: z.string(),
});

export const updatePaymentStatusSchema = z.object({
  paymentStatus: z.enum(["PENDING", "PAID"]),
});