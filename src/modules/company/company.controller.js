import * as companyService from "./company.service.js";
import {
  createCompanySchema,
  updateCompanySchema,
} from "./company.schema.js";

import asyncHandler from "../../shared/utils/asyncHandler.js";
import AppError from "../../shared/utils/appError.js";

export const createCompany = asyncHandler(async (req, res) => {
  const value = createCompanySchema.parse(req.body);

  const company = await companyService.createCompany(value);

  res.status(201).json({
    success: true,
    message: "Company created successfully",
    data: company,
  });
});

export const getAllCompanies = asyncHandler(async (req, res) => {
  const result = await companyService.getAllCompanies(req.user, req.query);

  res.status(200).json({
    success: true,
    ...result,
  });
});

export const getCompany = asyncHandler(async (req, res) => {
  const company = await companyService.getCompanyById(req.params.id, req.user);
  if (!company) throw new AppError("Company not found", 404);

  res.status(200).json({
    success: true,
    data: company,
  });
});

export const updateCompany = asyncHandler(async (req, res) => {
  const value = updateCompanySchema.parse(req.body);

  const company = await companyService.updateCompany(
    req.params.id,
    value,
    req.user
  );

  if (!company) throw new AppError("Company not found", 404);

  res.status(200).json({
    success: true,
    message: "Company updated successfully",
    data: company,
  });
});

export const deleteCompany = asyncHandler(async (req, res) => {
  const company = await companyService.deleteCompany(req.params.id, req.user);
  if (!company) throw new AppError("Company not found", 404);

  res.status(200).json({
    success: true,
    message: "Company deactivated successfully",
  });
});

export const remindClient = asyncHandler(async (req, res) => {
  const result = await companyService.sendExpiryReminder(req.params.id);
  res.status(200).json(result);
});

export const blockCompany = asyncHandler(async (req, res) => {
  const company = await companyService.blockCompany(req.params.id, req.user);
  if (!company) throw new AppError("Company not found", 404);

  res.status(200).json({
    success: true,
    message: "Company account has been blocked.",
    data: company,
  });
});

export const unblockCompany = asyncHandler(async (req, res) => {
  const company = await companyService.unblockCompany(req.params.id, req.user);
  if (!company) throw new AppError("Company not found", 404);

  res.status(200).json({
    success: true,
    message: "Company account has been unblocked.",
    data: company,
  });
});