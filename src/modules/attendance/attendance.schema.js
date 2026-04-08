import { z } from "zod";

export const manualPunchSchema = z.object({
  employeeId: z.string().uuid(),
  punchTime: z.string().datetime(),
  punchType: z.enum(["IN", "OUT"]),
  reason: z.string().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string()
  }).optional(),
});

export const selfPunchSchema = z.object({
  reason: z.string().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().optional()
  }).optional(),
});

export const devicePushSchema = z.object({
  employeeCode: z.string(),
  punchTime: z.string().datetime(),
  deviceId: z.string(),
  punchType: z.enum(["IN", "OUT"]),
});