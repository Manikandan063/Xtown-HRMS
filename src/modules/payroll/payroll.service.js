import { Op } from "sequelize";
import PDFDocument from "pdfkit";
import { Employee, EmployeeSalary, Payroll, SalaryAdjustment, Company } from "../../models/initModels.js";
import AppError from "../../shared/utils/appError.js";
import { sequelize } from "../../config/db.js";
import { sendEmail } from "../../shared/utils/emailSender.js";
import { generatePayslipToBuffer } from "../../shared/utils/generatePayslip.js";

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

export const getCompanyPayrolls = async (companyId, query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const offset = (page - 1) * limit;

  const { rows, count } = await Payroll.findAndCountAll({ 
    where: { companyId },
    limit,
    offset,
    include: [{ model: Employee, attributes: ["firstName", "lastName", "employeeCode"] }],
    order: [['createdAt', 'DESC']]
  });

  return {
    total: count,
    page,
    limit,
    data: rows
  };
};

export const getEmployeePayrolls = async (employeeId, companyId, query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const offset = (page - 1) * limit;

  const { rows, count } = await Payroll.findAndCountAll({ 
    where: { employeeId, companyId },
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });

  return {
    total: count,
    page,
    limit,
    data: rows
  };
};

export const updatePaymentStatus = async (id, status, companyId) => {
  console.log(`[PAYROLL] Received status update request: ID=${id}, Status=${status}`);
  const payroll = await Payroll.findOne({ 
    where: { id, companyId },
    include: [
      { model: Employee, attributes: ["id", "firstName", "lastName", "officialEmail"] },
      { model: Company }
    ]
  });
  if (!payroll) throw new AppError("Payroll not found", 404);

  payroll.paymentStatus = status;
  if (status === "PAID") {
    payroll.paidDate = new Date();

    // Send Payment Confirmation Email
    if (payroll.Employee?.officialEmail) {
      console.log(`[PAYROLL] Data Check - Employee Name: ${payroll.Employee.firstName}, Email: ${payroll.Employee.officialEmail}`);
      console.log(`[PAYROLL] Salary paid for ${payroll.Employee.firstName}. Generating PDF and sending email...`);
      
      try {
        // Generate PDF Buffer
        const pdfBuffer = await generatePayslipToBuffer(payroll, payroll.Employee, payroll.Company);

        const subject = `Salary Disbursed - ${payroll.month}`;
        const html = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1f2937; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 24px; background-color: #ffffff;">
               <div style="text-align: center; margin-bottom: 30px;">
                  <div style="background-color: #f3f4f6; width: 64px; height: 64px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                     <span style="font-size: 32px;">💰</span>
                  </div>
                  <h2 style="color: #111827; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; text-transform: uppercase;">Salary Disbursed</h2>
                  <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Monthly compensation node synchronized</p>
               </div>

               <div style="border-top: 1px solid #f3f4f6; padding-top: 30px; margin-bottom: 30px;">
                  <p style="font-size: 16px; line-height: 1.6;">Hello <b>${payroll.Employee.firstName} ${payroll.Employee.lastName}</b>,</p>
                  <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">We are pleased to inform you that your salary for the month of <b>${payroll.month}</b> has been successfully disbursed. Please find your official payslip attached to this email.</p>
               </div>

               <div style="background-color: #f9fafb; padding: 32px; border-radius: 20px; text-align: center; border: 1px solid #f3f4f6;">
                  <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em; margin-bottom: 8px;">Net Amount Disbursed</p>
                  <p style="margin: 0; font-size: 40px; font-weight: 900; color: #059669; letter-spacing: -0.05em;">₹${payroll.netSalary?.toLocaleString('en-IN')}</p>
               </div>

               <div style="margin-top: 30px; text-align: center;">
                  <p style="font-size: 14px; color: #6b7280; line-height: 1.5;">You can also view and download your full historical financial breakdown from the employee portal.</p>
               </div>

               <div style="border-top: 1px solid #f3f4f6; margin-top: 40px; padding-top: 30px;">
                  <p style="font-size: 13px; color: #9ca3af; line-height: 1.6;">
                     Regards,<br>
                     <b style="color: #4b5563;">Finance & Operations</b><br>
                     XTown HRMS Corporation
                  </p>
               </div>
            </div>
         `;

        const attachments = [
            {
                filename: `payslip-${payroll.month}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }
        ];

        sendEmail(payroll.Employee.officialEmail, subject, `Your salary for ${payroll.month} has been disbursed.`, html, attachments)
          .then(() => console.log(`[PAYROLL] Email with PDF sent successfully to ${payroll.Employee.officialEmail}`))
          .catch(err => console.error(`[PAYROLL] FATAL ERROR sending email to ${payroll.Employee.officialEmail}:`, err));
      } catch (pdfErr) {
        console.error("[PAYROLL] PDF Generation failed:", pdfErr);
      }
    } else {
      console.warn(`[PAYROLL] Skip email: No official email found for employee ID: ${payroll.employeeId}`);
    }
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
    totalNetSalary: totalSalary || 0,
    employeesPaid: totalEmployees,
    pendingPayrolls: pendingPayments,
    paidPayrolls: paidPayments
  };
};

export const getEmployeePayrollSummary = async (companyId, employeeId) => {
  const currentYear = new Date().getFullYear();
  
  // 1. Total Net Salary for the year
  const totalEarnings = await Payroll.sum("netSalary", { 
    where: { 
      employeeId, 
      companyId,
      paymentStatus: 'PAID',
      month: { [Op.like]: `${currentYear}-%` }
    } 
  });

  // 2. Latest Net Salary
  const latestPayroll = await Payroll.findOne({
    where: { employeeId, companyId, paymentStatus: 'PAID' },
    order: [['month', 'DESC']]
  });

  // 3. Total Deductions for the year
  const totalDeductions = await Payroll.sum("deductions", {
    where: { 
      employeeId, 
      companyId,
      month: { [Op.like]: `${currentYear}-%` }
    }
  });

  return {
    totalEarnings: totalEarnings || 0,
    latestSalary: latestPayroll?.netSalary || 0,
    totalDeductions: totalDeductions || 0,
    monthCount: latestPayroll ? 1 : 0 // Simplified indicator
  };
};

/* ===============================
   BATCH PAYROLL GENERATION
=============================== */
export const createBatchPayroll = async (month, companyId) => {
    // 1. Fetch all active employees for this company
    const employees = await Employee.findAll({
        where: { companyId, status: 'ACTIVE' }
    });

    if (employees.length === 0) {
        throw new AppError("No active employees found in company", 404);
    }

    const results = {
        processed: 0,
        skipped: 0,
        errors: []
    };

    for (const emp of employees) {
        try {
            // Check if payroll already exists for this month
            const exists = await Payroll.findOne({
                where: { employeeId: emp.id, month, companyId }
            });

            if (exists) {
                results.skipped++;
                continue;
            }

            // Create payroll for this employee
            await createPayroll({ employeeId: emp.id, month }, companyId);
            results.processed++;
        } catch (err) {
            results.errors.push({ employeeId: emp.id, error: err.message });
        }
    }

    return results;
};