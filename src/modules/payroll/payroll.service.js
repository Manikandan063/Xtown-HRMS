import PDFDocument from "pdfkit";
import { Employee, EmployeeSalary, Payroll, SalaryAdjustment } from "../../models/initModels.js";
import AppError from "../../shared/appError.js";
import { sequelize } from "../../config/db.js";

export const createPayroll = async (data, companyId) => {
  const { employeeId, month, overtimeHours = 0, overtimeRate = 0 } = data;

  // 1. Fetch current employee salary from MySQL
  const salaryDetails = await EmployeeSalary.findOne({ where: { employeeId } });
  if (!salaryDetails) {
    throw new AppError("No salary structure found for this employee", 404);
  }

  // 2. Fetch Adjustments from centralized model
  const adjustments = await SalaryAdjustment.findAll({ where: { employeeId } });
  const totalAdjustments = adjustments.reduce((acc, curr) => {
    return curr.type === 'increment' ? acc + parseFloat(curr.amount) : acc - parseFloat(curr.amount);
  }, 0);

  // 3. Calculate Overtime
  const overtimePay = parseFloat(overtimeHours) * parseFloat(overtimeRate);

  // 4. Calculate Net Salary
  // net_salary = basic + hra + da + medicalAllowance + conveyance + bonus + incentives - deductions - pfAmount - esiAmount + totalAdjustments + overtimePay
  const netSalary = parseFloat(salaryDetails.basicSalary) +
    parseFloat(salaryDetails.hra) +
    parseFloat(salaryDetails.da) +
    parseFloat(salaryDetails.medicalAllowance) +
    parseFloat(salaryDetails.conveyance) +
    parseFloat(salaryDetails.bonus) +
    parseFloat(salaryDetails.incentives) -
    parseFloat(salaryDetails.deductions) -
    parseFloat(salaryDetails.pfAmount || 0) -
    parseFloat(salaryDetails.esiAmount || 0) +
    totalAdjustments +
    overtimePay;

  const payroll = await Payroll.create({
    companyId,
    employeeId,
    month,
    basicSalary: salaryDetails.basicSalary,
    allowances: parseFloat(salaryDetails.hra) + parseFloat(salaryDetails.da) + parseFloat(salaryDetails.medicalAllowance) + parseFloat(salaryDetails.conveyance),
    deductions: parseFloat(salaryDetails.deductions) + parseFloat(salaryDetails.pfAmount || 0) + parseFloat(salaryDetails.esiAmount || 0),
    pfDeduction: salaryDetails.pfAmount || 0,
    esiDeduction: salaryDetails.esiAmount || 0,
    overtimeHours,
    overtimePay,
    netSalary,
  });

  return payroll;
};

export const getCompanyPayrolls = async (companyId) => {
  return await Payroll.findAll({ 
    where: { companyId },
    include: [{ model: Employee, attributes: ["firstName", "lastName", "employeeCode"] }]
  });
};

export const getEmployeePayrolls = async (employeeId, companyId) => {
  return await Payroll.findAll({ where: { employeeId, companyId } });
};

export const updatePaymentStatus = async (id, status, companyId) => {
  const payroll = await Payroll.findOne({ where: { id, companyId } });
  if (!payroll) throw new AppError("Payroll not found", 404);

  payroll.paymentStatus = status;
  if (status === "PAID") {
    payroll.paidDate = new Date();
  }
  return await payroll.save();
};

export const generatePayslipService = async (companyId, payrollId, res) => {
  const payroll = await Payroll.findOne({
    where: { id: payrollId, companyId },
    include: [
      {
        model: Employee,
        attributes: [
          "firstName",
          "lastName",
          "employeeCode",
        ],
      },
    ],
  });

  if (!payroll) {
    throw new AppError("Payroll not found", 404);
  }

  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=payslip-${payroll.month}.pdf`
  );

  doc.pipe(res);

  /* ===============================
     🏢 COMPANY HEADER
  =============================== */

  doc
    .fontSize(20)
    .font("Helvetica-Bold")
    .text("XTown HRMS", { align: "center" });

  doc
    .fontSize(10)
    .font("Helvetica")
    .text("Salary Slip for the Month of " + payroll.month, { align: "center" });

  doc.moveDown(1.5);

  /* ===============================
     👤 EMPLOYEE DETAILS
  =============================== */

  doc.fontSize(11).font("Helvetica");

  doc.text(`Employee Name: ${payroll.Employee.firstName} ${payroll.Employee.lastName}`);
  doc.text(`Employee Code: ${payroll.Employee.employeeCode}`);
  doc.text(`Month: ${payroll.month}`);
  doc.moveDown(1.5);

  /* ===============================
     💰 SALARY TABLE
  =============================== */

  const tableTop = doc.y;
  const earningsX = 50;
  const deductionsX = 320;

  doc.font("Helvetica-Bold").text("EARNINGS", earningsX, tableTop);
  doc.text("DEDUCTIONS", deductionsX, tableTop);

  doc.moveDown();

  doc.font("Helvetica");

  const rowSpacing = 20;

  // Earnings
  doc.text("Basic Salary", earningsX, tableTop + 30);
  doc.text(`\u20B9 ${payroll.basicSalary}`, earningsX + 150, tableTop + 30);

  doc.text("Allowances", earningsX, tableTop + 30 + rowSpacing);
  doc.text(`\u20B9 ${payroll.allowances}`, earningsX + 150, tableTop + 30 + rowSpacing);

  doc.text("Overtime Pay", earningsX, tableTop + 30 + (2 * rowSpacing));
  doc.text(`\u20B9 ${payroll.overtimePay}`, earningsX + 150, tableTop + 30 + (2 * rowSpacing));

  // Deductions
  doc.text("Deductions", deductionsX, tableTop + 30);
  doc.text(`\u20B9 ${payroll.deductions}`, deductionsX + 120, tableTop + 30);

  doc.moveDown(4);

  /* ===============================
     🟢 NET SALARY HIGHLIGHT
  =============================== */

  doc
    .rect(50, doc.y, 500, 40)
    .stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text(
      `NET SALARY: \u20B9 ${payroll.netSalary}`,
      0,
      doc.y + 12,
      { align: "center" }
    );

  doc.moveDown(4);

  /* ===============================
     ✍ SIGNATURE SECTION
  =============================== */

  doc.moveDown(2);

  doc
    .fontSize(11)
    .font("Helvetica")
    .text("Authorized Signature", 400);

  doc.moveTo(380, doc.y + 20)
     .lineTo(550, doc.y + 20)
     .stroke();

  doc.moveDown(4);

  /* ===============================
     📌 FOOTER
  =============================== */

  doc
    .fontSize(8)
    .fillColor("gray")
    .text(
      `Generated on ${new Date().toLocaleString()}`,
      50,
      780,
      { align: "center" }
    );

  doc.end();
};

/* ===============================
   PAYROLL SUMMARY (For MD/HR)
=============================== */

export const getPayrollSummary = async (companyId) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const totalSalary = await Payroll.sum("netSalary", { where: { companyId, month: currentMonth } });
  const totalEmployees = await Payroll.count({ 
    where: { companyId, month: currentMonth }, 
    distinct: true, 
    col: 'employeeId' 
  });
  const pendingPayments = await Payroll.count({ where: { companyId, month: currentMonth, paymentStatus: 'PENDING' } });
  const paidPayments = await Payroll.count({ where: { companyId, month: currentMonth, paymentStatus: 'PAID' } });

  return {
    month: currentMonth,
    totalSalary: totalSalary || 0,
    totalEmployeesPaid: totalEmployees,
    pendingPayments,
    paidPayments
  };
};