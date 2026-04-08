import { z } from "zod";

export const createDesignationSchema = z.object({
  name: z.string().min(2, "Designation name is required"),
  departmentId: z.string().uuid(),
  description: z.string().optional(),
});

export const updateDesignationSchema = z.object({
  name: z.string().min(2).optional(),
  departmentId: z.string().uuid().optional(),
  description: z.string().optional(),
  status: z.boolean().optional(),
});