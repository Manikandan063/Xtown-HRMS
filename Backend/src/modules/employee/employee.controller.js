import asyncHandler from "../../shared/utils/asyncHandler.js";
import fs from "fs";
import path from "path";
import * as employeeService from "./employee.service.js";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeQuerySchema,
  updatePersonalSchema,
  updateBankDetailSchema,
} from "./employee.schema.js";
import { db } from "../../models/initModels.js";

/* =====================================================
   CREATE EMPLOYEE
===================================================== */

export const createEmployee = asyncHandler(async (req, res) => {
  const data = createEmployeeSchema.parse(req.body);

  const employee = await employeeService.createEmployee(
    data,
    req.user
  );

  res.status(201).json({
    success: true,
    message: "Employee created successfully",
    data: employee,
  });
});

/* =====================================================
   GET ALL EMPLOYEES
===================================================== */

export const getAllEmployees = asyncHandler(async (req, res) => {
  const query = employeeQuerySchema.parse(req.query);

  const result = await employeeService.getAllEmployees(
    query,
    req.user
  );

  res.json({
    success: true,
    ...result,
  });
});

/* =====================================================
   GET EMPLOYEE BY ID
===================================================== */

export const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await employeeService.getEmployeeById(
    req.params.id,
    req.user
  );

  res.json({
    success: true,
    data: employee,
  });
});

/* =====================================================
   UPDATE EMPLOYEE
===================================================== */

export const updateEmployee = asyncHandler(async (req, res) => {
  const data = updateEmployeeSchema.parse(req.body);

  const employee = await employeeService.updateEmployee(
    req.params.id,
    data,
    req.user
  );

  res.json({
    success: true,
    message: "Employee updated successfully",
    data: employee,
  });
});

/* =====================================================
   DELETE EMPLOYEE
===================================================== */

export const deleteEmployee = asyncHandler(async (req, res) => {
  await employeeService.deleteEmployee(
    req.params.id,
    req.user
  );

  res.json({
    success: true,
    message: "Employee deleted successfully",
  });
});

/* =====================================================
   UPDATE PERSONAL DETAILS
===================================================== */

export const updatePersonalDetail = asyncHandler(async (req, res) => {
  const data = updatePersonalSchema.parse(req.body);

  const personal = await employeeService.updatePersonalDetail(
    req.params.id,
    data,
    req.user
  );

  res.json({
    success: true,
    message: "Personal details updated successfully",
    data: personal,
  });
});

/* =====================================================
   UPDATE BANK DETAIL
===================================================== */

export const updateBankDetail = asyncHandler(async (req, res) => {
  const data = updateBankDetailSchema.parse(req.body);

  const bankDetail = await employeeService.updateBankDetail(
    req.params.id,
    data,
    req.user
  );

  res.json({
    success: true,
    message: "Bank details updated successfully",
    data: bankDetail,
  });
});

export const updateEmergencyContact = asyncHandler(async (req, res) => {
  const employeeId = req.params.id;

  const emergency = await employeeService.updateEmergencyContact(
    employeeId,
    req.body,
    req.user.companyId
  );

  res.status(200).json({
    success: true,
    data: emergency,
  });
});

export const updateEducation = asyncHandler(async (req, res) => {
  const employeeId = req.params.id;

  const education = await employeeService.updateEducation(
    employeeId,
    req.body,
    req.user.companyId
  );

  res.status(200).json({
    success: true,
    data: education,
  });
});

export const updateExperience = asyncHandler(async (req, res) => {
  const employeeId = req.params.id;

  const experience = await employeeService.updateExperience(
    employeeId,
    req.body,
    req.user.companyId
  );

  res.status(200).json({
    success: true,
    data: experience,
  });
});

export const updateSalary = asyncHandler(async (req, res) => {
  const employeeId = req.params.id;

  const salary = await employeeService.updateSalary(
    employeeId,
    req.body,
    req.user.companyId
  );

  res.status(200).json({
    success: true,
    data: salary,
  });
});

export const updateContactDetail = asyncHandler(async (req, res) => {
  const result = await employeeService.updateContactDetail(
    req.params.id,
    req.body,
    req.user.companyId
  );
  res.json({ success: true, data: result });
});

export const updateLegalDetail = asyncHandler(async (req, res) => {
  const result = await employeeService.updateLegalDetail(
    req.params.id,
    req.body,
    req.user.companyId
  );
  res.json({ success: true, data: result });
});

export const updateCertification = asyncHandler(async (req, res) => {
  const result = await employeeService.updateCertification(
    req.params.id,
    req.body,
    req.user.companyId
  );
  res.json({ success: true, data: result });
});

export const updateAsset = asyncHandler(async (req, res) => {
  const result = await employeeService.updateAsset(
    req.params.id,
    req.body,
    req.user.companyId
  );
  res.json({ success: true, data: result });
});

export const updateProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new Error("No image file uploaded");
  }


  const { Employee } = db;
  const employee = await Employee.findOne({ 
    where: { id: req.params.id, companyId: req.user.companyId } 
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  const imagePath = `/uploads/profiles/${req.file.filename}`;
  employee.profileImage = imagePath;
  await employee.save();

  res.json({
    success: true,
    message: "Profile image updated successfully",
    data: employee
  });
});

export const deleteProfileImage = asyncHandler(async (req, res) => {
  const { Employee } = db;
  const employee = await Employee.findOne({ 
    where: { id: req.params.id, companyId: req.user.companyId } 
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  // Remove file from disk if it exists
  if (employee.profileImage) {
    const fullPath = path.join(process.cwd(), employee.profileImage.startsWith('/') ? employee.profileImage.slice(1) : employee.profileImage);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  employee.profileImage = null;
  await employee.save();

  res.json({
    success: true,
    message: "Profile image removed successfully",
    data: employee
  });
});

export const toggleResignation = asyncHandler(async (req, res) => {
  const employee = await employeeService.toggleResignationAccess(
    req.params.id,
    req.user
  );

  res.json({
    success: true,
    message: `Resignation access ${employee.canResign ? 'enabled' : 'disabled'} successfully`,
    data: employee,
  });
});

export const requestResignationAccess = asyncHandler(async (req, res) => {
  await employeeService.requestResignationAccess(
    req.params.id,
    req.user
  );

  res.json({
    success: true,
    message: "Resignation access request sent to HR successfully.",
  });
});
