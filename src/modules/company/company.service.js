import { Company } from "../../models/company.model.js";
import AppError from "../../shared/appError.js";

export const createCompany = async (data) => {
  return await Company.create(data);
};

export const getAllCompanies = async (currentUser) => {
  const isSuperAdmin = currentUser.role?.toLowerCase().replace(/_/g, " ") === "super admin";

  if (!isSuperAdmin) {
    return await Company.findAll({ where: { id: currentUser.companyId } });
  }
  return await Company.findAll();
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