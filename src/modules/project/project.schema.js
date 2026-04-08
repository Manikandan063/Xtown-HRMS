import { z } from "zod";

export const createProjectSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  projectStatus: z
    .enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "ON_HOLD"])
    .optional(),
  progressPercentage: z.number().min(0).max(100).optional(),
  teamLeadId: z.string().uuid("Invalid Team Lead ID"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const assignEmployeeSchema = z.object({
  employeeId: z.string().uuid("Invalid Employee ID"),
  projectId: z.string().uuid("Invalid Project ID"),
  role: z.string().min(1, "Role is required"),
});
