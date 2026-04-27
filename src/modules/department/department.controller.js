import * as departmentService from "./department.service.js";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from "./department.schema.js";
import asyncHandler from "../../shared/utils/asyncHandler.js";

export const createDepartment = asyncHandler(async (req, res) => {
  const data = createDepartmentSchema.parse(req.body);

  const department = await departmentService.createDepartment(
    req.user.companyId,
    data
  );

  res.status(201).json({
    success: true,
    message: "Department created successfully",
    data: department,
  });
});

export const getDepartments = asyncHandler(async (req, res) => {
  const result = await departmentService.getAllDepartments(
    req.user.companyId,
    req.query
  );

  res.json({
    success: true,
    ...result,
  });
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const data = updateDepartmentSchema.parse(req.body);

  const department = await departmentService.updateDepartment(
    req.params.id,
    req.user.companyId,
    data
  );

  res.json({
    success: true,
    message: "Department updated successfully",
    data: department,
  });
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  await departmentService.deleteDepartment(
    req.params.id,
    req.user.companyId
  );

  res.json({
    success: true,
    message: "Department deleted successfully",
  });
});