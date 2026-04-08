import { db } from "../../models/initModels.js";
import AppError from "../../shared/appError.js";

const { CompanySettings, SystemSettings, RolePermission, Shift } = db;

/* =====================================================
   COMPANY SETTINGS
==================================================== */

export const getCompanySettings = async (companyId) => {
  let settings = await CompanySettings.findOne({ where: { companyId } });
  
  if (!settings) {
    // If not found, we don't throw error but maybe return empty or a default if desired.
    // However, for update logic, it's good to have it.
    return null;
  }
  return settings;
};

export const updateCompanySettings = async (companyId, data) => {
  let settings = await CompanySettings.findOne({ where: { companyId } });

  if (!settings) {
    settings = await CompanySettings.create({ ...data, companyId });
  } else {
    await settings.update(data);
  }

  return settings;
};

/* =====================================================
   SYSTEM SETTINGS
==================================================== */

export const getSystemSettings = async (companyId) => {
  const settings = await SystemSettings.findOne({
    where: { companyId },
    include: [{ model: Shift, as: "defaultShift", attributes: ["shiftName"] }]
  });
  return settings;
};

export const updateSystemSettings = async (companyId, data) => {
  let settings = await SystemSettings.findOne({ where: { companyId } });

  if (!settings) {
    settings = await SystemSettings.create({ ...data, companyId });
  } else {
    await settings.update(data);
  }

  return settings;
};

/* =====================================================
   ROLE PERMISSIONS
==================================================== */

export const getRolePermissions = async (role) => {
  const permission = await RolePermission.findOne({ where: { role } });
  if (!permission) {
    throw new AppError(`Permissions for role '${role}' not found`, 404);
  }
  return permission;
};

export const updateRolePermissions = async (role, data) => {
  let permission = await RolePermission.findOne({ where: { role } });

  if (!permission) {
    permission = await RolePermission.create({ ...data, role });
  } else {
    await permission.update(data);
  }

  return permission;
};
