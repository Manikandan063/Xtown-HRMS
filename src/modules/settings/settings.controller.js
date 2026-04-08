import asyncHandler from "../../shared/asyncHandler.js";
import * as settingsSchema from "./settings.schema.js";
import * as settingsService from "./settings.service.js";

/* =====================================================
   COMPANY SETTINGS CONTROLLERS
==================================================== */

export const getCompanySettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.getCompanySettings(req.user.companyId);
  res.status(200).json({
    success: true,
    data: settings,
  });
});

export const updateCompanySettings = asyncHandler(async (req, res) => {
  const data = settingsSchema.companySettingsSchema.parse(req.body);
  const settings = await settingsService.updateCompanySettings(
    req.user.companyId,
    data
  );
  res.status(200).json({
    success: true,
    message: "Company settings updated successfully",
    data: settings,
  });
});

/* =====================================================
   SYSTEM SETTINGS CONTROLLERS
==================================================== */

export const getSystemSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.getSystemSettings(req.user.companyId);
  res.status(200).json({
    success: true,
    data: settings,
  });
});

export const updateSystemSettings = asyncHandler(async (req, res) => {
  const data = settingsSchema.systemSettingsSchema.parse(req.body);
  const settings = await settingsService.updateSystemSettings(
    req.user.companyId,
    data
  );
  res.status(200).json({
    success: true,
    message: "System settings updated successfully",
    data: settings,
  });
});

/* =====================================================
   ROLE PERMISSION CONTROLLERS
==================================================== */

export const getRolePermissions = asyncHandler(async (req, res) => {
  const permission = await settingsService.getRolePermissions(req.params.role);
  res.status(200).json({
    success: true,
    data: permission,
  });
});

export const updateRolePermissions = asyncHandler(async (req, res) => {
  const data = settingsSchema.rolePermissionSchema.parse(req.body);
  const permission = await settingsService.updateRolePermissions(
    req.params.role,
    data
  );
  res.status(200).json({
    success: true,
    message: "Role permissions updated successfully",
    data: permission,
  });
});
