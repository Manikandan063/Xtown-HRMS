import asyncHandler from "../../shared/utils/asyncHandler.js";
import * as assetService from "./asset.service.js";

export const getAllAssets = asyncHandler(async (req, res) => {
  const result = await assetService.getAllAssets(req.query, req.user);
  res.json({
    success: true,
    ...result,
  });
});

export const getMyAssets = asyncHandler(async (req, res) => {
  // Assuming req.user.employeeId is set for employees
  // If not, we might need to find the employee record for the user
  const employeeId = req.user.employeeId || req.user.id; 
  const assets = await assetService.getMyAssets(employeeId);
  res.json({
    success: true,
    data: assets,
  });
});

export const createAsset = asyncHandler(async (req, res) => {
  const asset = await assetService.createAsset(req.body);
  res.status(201).json({
    success: true,
    message: "Asset assigned successfully",
    data: asset,
  });
});

export const updateAsset = asyncHandler(async (req, res) => {
  const asset = await assetService.updateAsset(req.params.id, req.body, req.user.companyId);
  res.json({
    success: true,
    message: "Asset updated successfully",
    data: asset,
  });
});

export const deleteAsset = asyncHandler(async (req, res) => {
  await assetService.deleteAsset(req.params.id, req.user.companyId);
  res.json({
    success: true,
    message: "Asset record deleted successfully",
  });
});
