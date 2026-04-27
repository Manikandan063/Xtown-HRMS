// modules/payroll/payroll.controller.js

import * as payrollService from "./payroll.service.js";
import { db } from "../../models/initModels.js";
const { Payroll, Employee, Company, Department, Designation } = db;
import AppError from "../../shared/utils/appError.js";
import { generatePayslip } from "../../shared/utils/generatePayslip.js";
import {
  createPayrollSchema,
  createBatchPayrollSchema,
  updatePaymentStatusSchema,
} from "./payroll.schema.js";

import asyncHandler from "../../shared/utils/asyncHandler.js";

// ✅ Create Payroll (Single or Batch)
export const createPayroll = asyncHandler(async (req, res) => {
  const isBatch = !req.body.employeeId;
  
  if (isBatch) {
    const { month } = createBatchPayrollSchema.parse(req.body);
    const results = await payrollService.createBatchPayroll(month, req.user.companyId);
    return res.status(201).json({
      success: true,
      message: `Batch processed: ${results.processed} generated, ${results.skipped} skipped.`,
      data: results
    });
  }

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
  const result = await payrollService.getCompanyPayrolls(
    req.user.companyId,
    req.query
  );

  res.status(200).json({
    success: true,
    ...result,
  });
});

// ✅ Get Employee Payrolls
export const getEmployeePayrolls = asyncHandler(async (req, res) => {
  const result = await payrollService.getEmployeePayrolls(
    req.params.employeeId,
    req.user.companyId,
    req.query
  );

  res.status(200).json({
    success: true,
    ...result,
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

  const employee = await Employee.findByPk(payroll.employeeId, {
    include: [
      { model: Department, as: 'department' },
      { model: Designation, as: 'designation' }
    ]
  });
  const company = await Company.findByPk(payroll.companyId);

  generatePayslip(res, payroll, employee, company);
});

// ✅ Get Payroll Summary (Support Admin & Employee scope)
export const getPayrollSummary = asyncHandler(async (req, res) => {
  const isEmployee = req.user.role === 'user' || req.user.role === 'employee';
  
  let summary;
  if (isEmployee) {
    summary = await payrollService.getEmployeePayrollSummary(req.user.companyId, req.user.employeeId);
  } else {
    summary = await payrollService.getPayrollSummary(req.user.companyId);
  }

  res.status(200).json({
    success: true,
    data: summary,
    message: "Financial summary synchronized"
  });
});