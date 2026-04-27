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

export const manualAttendanceSchema = z.object({
  employeeId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkInTime: z.string().nullable().optional(),
  checkOutTime: z.string().nullable().optional(),
  status: z.enum(["PRESENT", "ABSENT", "HALF_DAY", "LEAVE", "HOLIDAY"]),
  reason: z.string().optional(),
});