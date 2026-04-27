import { z } from "zod";

export const dateRangeSchema = z.object({
  query: z.object({
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    employeeId: z.string().uuid().optional(),
    departmentId: z.string().uuid().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const payrollReportSchema = z.object({
  query: z.object({
    month: z.string(), // format: 2026-02
    employeeId: z.string().uuid().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});