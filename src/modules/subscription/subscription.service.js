import { db } from "../../models/initModels.js";
import AppError from "../../shared/utils/appError.js";

const { Company, Employee, SubscriptionRequest, User, SubscriptionPlan } = db;

/**
 * 🔹 Get current subscription details for a company
 */
export const getSubscriptionInfo = async (companyId) => {
  const company = await Company.findByPk(companyId, {
    include: [{ model: SubscriptionPlan, as: 'planDetail' }]
  });
  
  if (!company) throw new AppError("Company not found", 404);

  const currentCount = await Employee.count({ where: { companyId } });
  
  // Use dynamic plan if available, else fallback to hardcoded logic or BASIC
  const plan = company.planDetail;
  
  // Check for expiry alert
  let expiryAlert = false;
  if (company.planExpiryDate) {
    const diff = new Date(company.planExpiryDate) - new Date();
    if (diff > 0 && diff < (30 * 24 * 60 * 60 * 1000)) {
      expiryAlert = true;
    }
  }

  return {
    plan: plan ? plan.name : company.subscriptionPlan,
    currentEmployeeCount: currentCount,
    maxEmployees: plan ? plan.maxEmployees : 50,
    features: plan ? plan.features : ["attendance", "leave"],
    remainingSlots: (plan ? plan.maxEmployees : 50) - currentCount,
    planStartDate: company.planStartDate,
    planExpiryDate: company.planExpiryDate,
    expiryAlert
  };
};

/**
 * 🔹 CRUD FOR PLANS (SuperAdmin)
 */
export const createPlan = async (data) => {
  return await SubscriptionPlan.create(data);
};

export const getPlans = async () => {
  return await SubscriptionPlan.findAll({ order: [['price', 'ASC']] });
};

export const updatePlan = async (id, data) => {
  const plan = await SubscriptionPlan.findByPk(id);
  if (!plan) throw new AppError("Plan not found", 404);
  await plan.update(data);
  return plan;
};

export const deletePlan = async (id) => {
  const plan = await SubscriptionPlan.findByPk(id);
  if (!plan) throw new AppError("Plan not found", 404);
  await plan.destroy();
  return true;
};

/**
 * 🔹 Create a Subscription Upgrade/Renewal Request (Admin)
 */
export const createSubscriptionRequest = async (companyId, data) => {
  const { planName, paymentReference, notes } = data;
  
  // Check if plan exists in DB
  const plan = await SubscriptionPlan.findOne({ where: { name: planName } });
  
  return await SubscriptionRequest.create({
    companyId,
    planName,
    price: plan ? plan.price : 0,
    paymentReference,
    notes,
    status: 'PENDING'
  });
};

/**
 * 🔹 Get All Subscription Requests (SuperAdmin)
 */
export const getAllSubscriptionRequests = async () => {
  return await SubscriptionRequest.findAll({
    include: [
      { model: Company, as: 'company', attributes: ['companyName', 'email'] }
    ],
    order: [['createdAt', 'DESC']]
  });
};

/**
 * 🔹 Get Requests for a specific Company (Admin)
 */
export const getCompanySubscriptionRequests = async (companyId) => {
  return await SubscriptionRequest.findAll({
    where: { companyId },
    order: [['createdAt', 'DESC']]
  });
};

/**
 * 🔹 Approve Subscription Request (SuperAdmin)
 */
export const approveSubscriptionRequest = async (requestId, adminUserId) => {
  const request = await SubscriptionRequest.findByPk(requestId);
  if (!request) throw new AppError("Request not found", 404);
  if (request.status !== 'PENDING') throw new AppError("Request already processed", 400);

  const company = await Company.findByPk(request.companyId);
  if (!company) throw new AppError("Target company no longer exists", 404);

  // Link to dynamic plan if found
  const plan = await SubscriptionPlan.findOne({ where: { name: request.planName } });

  // Update company plan and dates (Accumulative Renewal Logic)
  company.subscriptionPlan = request.planName;
  
  const daysToAdd = plan?.durationDays || 365;
  let newExpiry;

  // If already have an active future expiry, stack on top of it
  if (company.planExpiryDate && new Date(company.planExpiryDate) > new Date()) {
    newExpiry = new Date(company.planExpiryDate);
    newExpiry.setDate(newExpiry.getDate() + daysToAdd);
  } else {
    // New activation or renewal of expired plan
    company.planStartDate = new Date();
    newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + daysToAdd);
  }

  company.planExpiryDate = newExpiry;

  if (plan) {
    company.currentPlanId = plan.id;
  }
  await company.save();

  // Update request status
  request.status = 'APPROVED';
  request.processedAt = new Date();
  request.processedBy = adminUserId;
  await request.save();

  return { request, company };
};

/**
 * 🔹 Helper to check if adding an employee is allowed
 */
export const canAddEmployee = async (companyId) => {
  const company = await Company.findByPk(companyId, {
    include: [{ model: SubscriptionPlan, as: 'planDetail' }]
  });
  if (!company) return false;

  const currentCount = await Employee.count({ where: { companyId } });
  const maxEmployees = company.planDetail ? company.planDetail.maxEmployees : 50;

  if (currentCount >= maxEmployees) {
    throw new AppError(`Employee limit reached for ${company.subscriptionPlan} plan (${maxEmployees}). Please upgrade to add more.`, 403);
  }
  
  return true;
};
