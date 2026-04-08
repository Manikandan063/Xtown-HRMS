import { db } from "../../models/initModels.js";
import AppError from "../../shared/appError.js";

const { Company, Employee } = db;

/**
 * 🔹 PLAN LIMITS CONFIGURATION
 */
export const PLAN_LIMITS = {
  BASIC: { maxEmployees: 50, features: ["attendance", "leave"] },
  PREMIUM: { maxEmployees: 200, features: ["attendance", "leave", "payroll", "shift"] },
  ENTERPRISE: { maxEmployees: 10000, features: ["all"] },
};

/**
 * 🔹 Get current subscription details for a company
 */
export const getSubscriptionInfo = async (companyId) => {
  const company = await Company.findByPk(companyId);
  if (!company) throw new AppError("Company not found", 404);

  const currentCount = await Employee.count({ where: { companyId } });
  const limits = PLAN_LIMITS[company.subscriptionPlan];

  return {
    plan: company.subscriptionPlan,
    currentEmployeeCount: currentCount,
    maxEmployees: limits.maxEmployees,
    features: limits.features,
    remainingSlots: limits.maxEmployees - currentCount
  };
};

/**
 * 🔹 Upgrade/Change Company Subscription Plan
 */
export const upgradePlan = async (companyId, newPlan) => {
  if (typeof newPlan !== 'string' || !PLAN_LIMITS[newPlan.toUpperCase()]) {
    throw new AppError("Invalid subscription plan name. Choose from BASIC, PREMIUM, ENTERPRISE.", 400);
  }

  const company = await Company.findByPk(companyId);
  if (!company) throw new AppError("Company not found", 404);

  const targetPlan = newPlan.toUpperCase();
  
  // Check if current employees exceed new plan limit (if downgrading)
  const currentCount = await Employee.count({ where: { companyId } });
  if (currentCount > PLAN_LIMITS[targetPlan].maxEmployees) {
    throw new AppError(`Cannot switch to ${targetPlan}. Your current employee count (${currentCount}) exceeds the plan limit (${PLAN_LIMITS[targetPlan].maxEmployees}).`, 400);
  }

  company.subscriptionPlan = targetPlan;
  await company.save();

  return company;
};

/**
 * 🔹 Helper to check if adding an employee is allowed
 */
export const canAddEmployee = async (companyId) => {
  const company = await Company.findByPk(companyId);
  if (!company) return false;

  const currentCount = await Employee.count({ where: { companyId } });
  const limits = PLAN_LIMITS[company.subscriptionPlan];

  if (currentCount >= limits.maxEmployees) {
    throw new AppError(`Employee limit reached for ${company.subscriptionPlan} plan (${limits.maxEmployees}). Please upgrade to add more.`, 403);
  }
  
  return true;
};
