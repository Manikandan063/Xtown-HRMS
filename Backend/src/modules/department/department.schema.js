import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z
    .string()
    .min(2, "Department name must be at least 2 characters")
    .max(100),

  code: z.string().max(20).optional().nullable(),
  description: z.string().max(255).optional().nullable(),
  headId: z.string().uuid().optional().nullable(),
});

export const updateDepartmentSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(100)
    .optional(),

  code: z.string().max(20).optional().nullable(),
  description: z.string().max(255).optional().nullable(),
  headId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().optional(),
});