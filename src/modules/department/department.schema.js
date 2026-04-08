import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z
    .string()
    .min(2, "Department name must be at least 2 characters")
    .max(100),

  description: z.string().max(255).optional(),
});

export const updateDepartmentSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(100)
    .optional(),

  description: z.string().max(255).optional(),

  isActive: z.boolean().optional(),
});