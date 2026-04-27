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

  domain: z
    .string()
    .optional()
    .or(z.literal("")),

  registrationNumber: z
    .string()
    .optional()
    .or(z.literal("")),

  subscriptionPlan: z
    .enum(["BASIC", "PREMIUM", "ENTERPRISE"])
    .optional(),

  currentPlanId: z
    .string()
    .uuid("Invalid Plan Reference")
    .optional()
    .or(z.literal("")),
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

  domain: z.string().optional(),

  registrationNumber: z.string().optional(),

  subscriptionPlan: z
    .enum(["BASIC", "PREMIUM", "ENTERPRISE"])
    .optional(),

  currentPlanId: z
    .string()
    .uuid("Invalid Plan Reference")
    .optional()
    .or(z.literal("")),

  isActive: z.boolean().optional(),
});