import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Create Company Schema
|--------------------------------------------------------------------------
*/
export const createCompanySchema = z.object({
  companyName: z
    .string()
    .min(1, "Company name is required"),

  email: z
    .string()
    .email("Invalid email address"),

  phone: z
    .string()
    .min(1, "Phone number is required"),

  address: z
    .string()
    .optional()
    .or(z.literal("")),

  subscriptionPlan: z
    .enum(["BASIC", "PREMIUM", "ENTERPRISE"])
    .optional(),
});

/*
|--------------------------------------------------------------------------
| Update Company Schema
|--------------------------------------------------------------------------
*/
export const updateCompanySchema = z.object({
  companyName: z.string().min(1).optional(),

  phone: z.string().min(1).optional(),

  address: z.string().optional(),

  subscriptionPlan: z
    .enum(["BASIC", "PREMIUM", "ENTERPRISE"])
    .optional(),

  isActive: z.boolean().optional(),
});