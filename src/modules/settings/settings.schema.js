import { z } from "zod";

export const companySettingsSchema = z.object({
  companyName: z.string().min(1, "Company name is required").optional(),
  address: z.string().optional(),
  contactEmail: z.string().email("Invalid email format").optional(),
  contactPhone: z.string().optional(),
  logoUrl: z.string().optional(),
});

export const systemSettingsSchema = z.object({
  defaultShiftId: z.string().uuid("Invalid Shift ID").optional(),
  workingHoursPerDay: z.number().positive("Working hours must be positive").optional(),
  payrollCycle: z.enum(["MONTHLY", "WEEKLY"], {
    errorMap: () => ({ message: "Payroll cycle must be MONTHLY or WEEKLY" }),
  }).optional(),
  currency: z.string().optional(),
});

export const rolePermissionSchema = z.object({
  canCreateEmployee: z.boolean().optional(),
  canApproveLeave: z.boolean().optional(),
  canProcessPayroll: z.boolean().optional(),
});
