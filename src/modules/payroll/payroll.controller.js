// modules/payroll/payroll.controller.js

import * as payrollService from "./payroll.service.js";
import { db } from "../../models/initModels.js";
const { Payroll, Employee, Company } = db;
import AppError from "../../shared/appError.js";
import { generatePayslip } from "../../shared/utils/generatePayslip.js";
import {
  createPayrollSchema,
  updatePaymentStatusSchema,
} from "./payroll.schema.js";

import asyncHandler from "../../shared/asyncHandler.js";

// ✅ Create Payroll
export const createPayroll = asyncHandler(async (req, res) => {
  const parsedData = createPayrollSchema.parse(req.body);

  const payroll = await payrollService.createPayroll(
    parsedData,
    req.user.companyId
  );

  res.status(201).json({
    success: true,
    message: "Payroll created successfully",
    data: payroll,
  });
});

// ✅ Get Company Payrolls
export const getCompanyPayrolls = asyncHandler(async (req, res) => {
  const payrolls = await payrollService.getCompanyPayrolls(
    req.user.companyId
  );

  res.status(200).json({
    success: true,
    count: payrolls.length,
    data: payrolls,
  });
});

// ✅ Get Employee Payrolls
export const getEmployeePayrolls = asyncHandler(async (req, res) => {
  const payrolls = await payrollService.getEmployeePayrolls(
    req.params.employeeId,
    req.user.companyId
  );

  res.status(200).json({
    success: true,
    count: payrolls.length,
    data: payrolls,
  });
});

// ✅ Update Payment Status
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const parsedData = updatePaymentStatusSchema.parse(req.body);

  const payroll = await payrollService.updatePaymentStatus(
    req.params.id,
    parsedData.paymentStatus,
    req.user.companyId
  );

  res.status(200).json({
    success: true,
    message: "Payment status updated successfully",
    data: payroll,
  });
});

export const downloadPayslip = asyncHandler(async (req, res) => {
  const payroll = await Payroll.findOne({
    where: { id: req.params.id, companyId: req.user.companyId },
  });

  if (!payroll) {
    throw new AppError("Payroll not found", 404);
  }

  if (payroll.paymentStatus !== "PAID") {
    throw new AppError("Payslip available only after payment", 400);
  }

  const employee = await Employee.findByPk(payroll.employeeId);
  const company = await Company.findByPk(payroll.companyId);

  generatePayslip(res, payroll, employee, company);
});

// ✅ Get Payroll Summary (MD/HR Only)
export const getPayrollSummary = asyncHandler(async (req, res) => {
  const summary = await payrollService.getPayrollSummary(req.user.companyId);
  res.status(200).json({
    success: true,
    data: summary,
    message: "Payroll summary fetched successfully"
  });
});