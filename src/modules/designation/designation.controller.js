import * as designationService from "./designation.service.js";
import {
  createDesignationSchema,
  updateDesignationSchema,
} from "./designation.schema.js";

import asyncHandler from "../../shared/asyncHandler.js";
import AppError from "../../shared/appError.js";

export const createDesignation = asyncHandler(async (req, res) => {
  const validated = createDesignationSchema.parse(req.body);

  const designation = await designationService.createDesignation({
    ...validated,
    companyId: req.user.companyId,
  });

  res.status(201).json({
    success: true,
    data: designation,
  });
});

export const getAllDesignations = asyncHandler(async (req, res) => {
  const designations = await designationService.getAllDesignations(
    req.user.companyId
  );

  res.json({
    success: true,
    data: designations,
  });
});

export const updateDesignation = asyncHandler(async (req, res) => {
  const validated = updateDesignationSchema.parse(req.body);

  await designationService.updateDesignation(
    req.params.id,
    req.user.companyId,
    validated
  );

  res.json({
    success: true,
    message: "Designation updated successfully",
  });
});

export const deleteDesignation = asyncHandler(async (req, res) => {
  await designationService.deleteDesignation(
    req.params.id,
    req.user.companyId
  );

  res.json({
    success: true,
    message: "Designation deleted successfully",
  });
});