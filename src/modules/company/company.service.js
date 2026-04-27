import { Company } from "../../models/company.model.js";
import { SubscriptionPlan } from "../../models/subscriptionPlan.model.js";
import { db } from "../../models/initModels.js";
import AppError from "../../shared/utils/appError.js";

const { Notification, User } = db;

export const createCompany = async (data) => {
  if (data.currentPlanId) {
    const plan = await SubscriptionPlan.findByPk(data.currentPlanId);
    if (plan) {
      const planName = plan.name.toUpperCase();
      if (["BASIC", "PREMIUM", "ENTERPRISE"].includes(planName)) {
        data.subscriptionPlan = planName;
      }
      // Initialize lifecycle dates
      data.planStartDate = new Date();
      const expiry = new Date();
      const days = plan.durationDays || 365;
      expiry.setDate(expiry.getDate() + days);
      data.planExpiryDate = expiry;
    }
  }
  return await Company.create(data);
};

export const getAllCompanies = async (currentUser, query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const offset = (page - 1) * limit;

  const rawRole = String(currentUser.role || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const isSuperAdmin = rawRole === "superadmin";

  if (!isSuperAdmin) {
    return {
      total: 1,
      page: 1,
      limit: 1,
      data: await Company.findAll({ where: { id: currentUser.companyId } })
    };
  }

  const { rows, count } = await Company.findAndCountAll({
    limit,
    offset,
    order: [["createdAt", "DESC"]]
  });

  return {
    total: count,
    page,
    limit,
    data: rows
  };
};

export const getCompanyById = async (id, currentUser) => {
  const isSuperAdmin = currentUser.role?.toLowerCase().replace(/_/g, " ") === "super admin";

  if (!isSuperAdmin && id !== currentUser.companyId) {
    throw new AppError("Forbidden - Cannot access other company data", 403);
  }
  return await Company.findByPk(id);
};

export const updateCompany = async (id, data, currentUser) => {
  const isSuperAdmin = currentUser.role?.toLowerCase().replace(/_/g, " ") === "super admin";

  if (!isSuperAdmin && id !== currentUser.companyId) {
    throw new AppError("Forbidden - Cannot update other company data", 403);
  }

  const company = await Company.findByPk(id);
  if (!company) return null;

  // Sync ENUM and Lifecycle dates if plan changes
  if (data.currentPlanId && data.currentPlanId !== company.currentPlanId) {
    const plan = await SubscriptionPlan.findByPk(data.currentPlanId);
    if (plan) {
      const planName = plan.name.toUpperCase();
      if (['BASIC', 'PREMIUM', 'ENTERPRISE'].includes(planName)) {
        data.subscriptionPlan = planName;
      }
      
      // Update lifecycle dates for the new plan
      data.planStartDate = new Date();
      const expiry = new Date();
      const days = plan.durationDays || 365;
      expiry.setDate(expiry.getDate() + days);
      data.planExpiryDate = expiry;
    }
  }

  await company.update(data);
  return company;
};

export const deleteCompany = async (id, currentUser) => {
  const isSuperAdmin = currentUser.role?.toLowerCase().replace(/_/g, " ") === "super admin";

  if (!isSuperAdmin) {
    throw new AppError("Forbidden - Only Super Admin can deactivate companies", 403);
  }

  const company = await Company.findByPk(id);
  if (!company) return null;

  await company.update({ isActive: false });
  return company;
};

export const sendExpiryReminder = async (id) => {
  const company = await Company.findByPk(id, {
    include: [{ model: SubscriptionPlan, as: 'planDetail' }]
  });
  if (!company) throw new AppError("Company not found", 404);

  // Find Admin for this company (using case-insensitive or exact lowercase as per seeder)
  const admins = await User.findAll({
    where: { companyId: id },
    include: [{ 
      model: db.Role, 
      as: 'role', 
      where: { name: { [db.sequelize.Sequelize.Op.iLike]: 'admin' } } 
    }]
  });

  const nextPlanPrice = company.planDetail ? company.planDetail.price : 'TBD';
  const expiryDate = company.planExpiryDate ? new Date(company.planExpiryDate).toLocaleDateString() : 'Soon';

  const title = "⚠️ Subscription Expiring Soon";
  const message = `Your ${company.subscriptionPlan} plan is set to expire on ${expiryDate}. Renew now at ₹${nextPlanPrice} to avoid service interruption and maintain your enterprise node connectivity. Upgrade options are available in your License Tier dashboard.`;

  // 1. Create System Notifications for all admins
  if (admins && admins.length > 0) {
    await Promise.all(admins.map(admin => 
      Notification.create({
        companyId: id,
        userId: admin.id,
        title,
        message,
        type: 'SUBSCRIPTION',
        isRead: false
      })
    ));
  }


  // 2. Mock Email Logic
  console.log(`[EMAIL DISPATCH] To: ${company.email} | Subject: ${title} | Body: ${message}`);

  return { success: true, message: "Reminder sent to client admin." };
};

export const blockCompany = async (id, currentUser) => {
  const isSuperAdmin = currentUser.role?.toLowerCase().replace(/_/g, " ") === "super admin";
  if (!isSuperAdmin) {
    throw new AppError("Forbidden - Only Super Admin can block companies", 403);
  }

  const company = await Company.findByPk(id);
  if (!company) return null;

  await company.update({ status: "BLOCKED" });
  return company;
};

export const unblockCompany = async (id, currentUser) => {
  const isSuperAdmin = currentUser.role?.toLowerCase().replace(/_/g, " ") === "super admin";
  if (!isSuperAdmin) {
    throw new AppError("Forbidden - Only Super Admin can unblock companies", 403);
  }

  const company = await Company.findByPk(id);
  if (!company) return null;

  await company.update({ status: "ACTIVE" });
  return company;
};