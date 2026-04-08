// modules/payroll/payroll.schema.js

import { z } from "zod";

export const createPayrollSchema = z.object({
  employeeId: z.string().uuid(),
  month: z.string(),
  basicSalary: z.coerce.number(),
  allowances: z.coerce.number().optional(),
  deductions: z.coerce.number().optional(),
});

export const updatePaymentStatusSchema = z.object({
  paymentStatus: z.enum(["PENDING", "PAID"]),
});