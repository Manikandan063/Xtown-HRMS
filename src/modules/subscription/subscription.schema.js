import { z } from "zod";

/**
 * 🔹 Schema for creating or updating a Subscription Plan (SuperAdmin)
 */
export const planSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Plan name must be at least 2 characters").toUpperCase(),
    price: z.coerce.number().min(0, "Price cannot be negative"),
    maxEmployees: z.coerce.number().min(1, "Employee cap must be at least 1"),
    durationDays: z.coerce.number().min(1, "Duration must be at least 1 day"),
    isActive: z.boolean().optional(),
    features: z.array(z.string()).optional(),
  }),
});

/**
 * 🔹 Schema for creating a Subscription Request (Admin)
 */
export const createRequestSchema = z.object({
  body: z.object({
    planName: z.string().min(1, "Target plan name is required"),
    paymentReference: z.string().min(5, "Payment reference is required for verification"),
    notes: z.string().optional(),
  }),
});
