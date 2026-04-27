import PDFDocument from "pdfkit";

export const generatePayslipContent = (doc, payroll, employee, company) => {
  const margin = 50;
  const pageWidth = doc.page.width - 2 * margin;
  const colWidth = pageWidth / 2;
  
  // =========================
  // OUTER BORDER
  // =========================
  doc.rect(margin - 10, margin - 10, pageWidth + 20, 715).stroke();

  // =========================
  // HEADER SECTION
  // =========================
  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text(company?.companyName || "XTOWN PARTNER CORPORATION", { align: "center", characterSpacing: 1 });

  doc
    .fontSize(8)
    .font("Helvetica")
    .text(company?.address || "Corporate Office, Enterprise Tower, India", { align: "center" })
    .text(`Contact: ${company?.contactEmail || 'admin@xtown.com'} | Website: ${company?.website || 'www.xtown.com'}`, { align: "center" });

  doc.moveDown(0.5);
  doc.moveTo(margin, doc.y).lineTo(margin + pageWidth, doc.y).stroke();
  doc.moveDown(0.5);

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text(`PAYSLIP FOR THE MONTH OF ${payroll.month.toUpperCase()}`, { align: "center" });

  doc.moveDown(0.5);
  doc.moveTo(margin, doc.y).lineTo(margin + pageWidth, doc.y).stroke();
  doc.moveDown(1.5);

  // =========================
  // EMPLOYEE INFO (Two Columns)
  // =========================
  const infoY = doc.y;
  const labelOffset = 90;

  // Column 1
  doc.fontSize(9).font("Helvetica-Bold").text("Employee Name:", margin, infoY);
  doc.font("Helvetica").text(`${employee.firstName} ${employee.lastName}`, margin + labelOffset, infoY);
  
  doc.font("Helvetica-Bold").text("Employee ID:", margin, infoY + 15);
  doc.font("Helvetica").text(employee.employeeCode || "EMP-001", margin + labelOffset, infoY + 15);

  doc.font("Helvetica-Bold").text("Department:", margin, infoY + 30);
  doc.font("Helvetica").text(employee?.department?.name || "Operations", margin + labelOffset, infoY + 30);

  // Column 2
  doc.font("Helvetica-Bold").text("Designation:", margin + colWidth, infoY);
  doc.font("Helvetica").text(employee?.designation?.name || "Professional Staff", margin + colWidth + labelOffset, infoY);

  doc.font("Helvetica-Bold").text("Joining Date:", margin + colWidth, infoY + 15);
  doc.font("Helvetica").text(employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : 'N/A', margin + colWidth + labelOffset, infoY + 15);

  doc.font("Helvetica-Bold").text("Payment Mode:", margin + colWidth, infoY + 30);
  doc.font("Helvetica").text("Bank Transfer", margin + colWidth + labelOffset, infoY + 30);

  doc.moveDown(3);

  // =========================
  // SALARY TABLE (Earnings & Deductions)
  // =========================
  const tableHeaderY = doc.y;
  const tableRowHeight = 25;

  // Header Box
  doc.rect(margin, tableHeaderY, pageWidth, tableRowHeight).fillAndStroke("#f8fafc", "#64748b");
  
  doc.fillColor("#000").font("Helvetica-Bold").fontSize(9);
  doc.text("EARNINGS", margin + 10, tableHeaderY + 8);
  doc.text("AMOUNT (₹)", margin + colWidth - 85, tableHeaderY + 8, { width: 80, align: 'right' });
  doc.text("DEDUCTIONS", margin + colWidth + 10, tableHeaderY + 8);
  doc.text("AMOUNT (₹)", margin + pageWidth - 85, tableHeaderY + 8, { width: 80, align: 'right' });

  // Rows
  const bodyY = tableHeaderY + tableRowHeight;
  const bodyHeight = 110;
  doc.rect(margin, bodyY, pageWidth, bodyHeight).stroke(); // Main Table Body
  doc.moveTo(margin + colWidth, bodyY).lineTo(margin + colWidth, bodyY + bodyHeight).stroke(); // Vertical Separator

  doc.font("Helvetica").fontSize(9);
  
  // Row 1: Basic
  doc.text("Basic Salary", margin + 10, bodyY + 15);
  doc.text(parseFloat(payroll.basicSalary).toLocaleString('en-IN', { minimumFractionDigits: 2 }), margin + colWidth - 85, bodyY + 15, { width: 80, align: 'right' });
  
  doc.text("Provident Fund (PF)", margin + colWidth + 10, bodyY + 15);
  doc.text(parseFloat(payroll.pfDeduction || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }), margin + pageWidth - 85, bodyY + 15, { width: 80, align: 'right' });

  // Row 2: Allowances / ESI
  doc.text("HRA & Allowances", margin + 10, bodyY + 40);
  doc.text(parseFloat(payroll.allowances).toLocaleString('en-IN', { minimumFractionDigits: 2 }), margin + colWidth - 85, bodyY + 40, { width: 80, align: 'right' });

  doc.text("ESI", margin + colWidth + 10, bodyY + 40);
  doc.text(parseFloat(payroll.esiDeduction || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }), margin + pageWidth - 85, bodyY + 40, { width: 80, align: 'right' });

  // Row 3: Overtime / Professional Tax or Other
  doc.text("Overtime Pay", margin + 10, bodyY + 65);
  doc.text(parseFloat(payroll.overtimePay || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }), margin + colWidth - 85, bodyY + 65, { width: 80, align: 'right' });

  doc.text("Other Deductions", margin + colWidth + 10, bodyY + 65);
  doc.text(parseFloat(payroll.deductions).toLocaleString('en-IN', { minimumFractionDigits: 2 }), margin + pageWidth - 85, bodyY + 65, { width: 80, align: 'right' });

  // =========================
  // TOTALS
  // =========================
  const totalY = bodyY + bodyHeight;
  doc.rect(margin, totalY, pageWidth, tableRowHeight).fillAndStroke("#f1f5f9", "#64748b");
  
  const totalEarnings = parseFloat(payroll.basicSalary) + parseFloat(payroll.allowances) + parseFloat(payroll.overtimePay || 0);
  const totalDeductions = parseFloat(payroll.deductions) + parseFloat(payroll.pfDeduction || 0) + parseFloat(payroll.esiDeduction || 0);

  doc.fillColor("#000").font("Helvetica-Bold");
  doc.text("Total Earnings (A)", margin + 10, totalY + 8);
  doc.text(totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 }), margin + colWidth - 85, totalY + 8, { width: 80, align: 'right' });
  
  doc.text("Total Deductions (B)", margin + colWidth + 10, totalY + 8);
  doc.text(totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 }), margin + pageWidth - 85, totalY + 8, { width: 80, align: 'right' });

  doc.moveDown(1.5);

  // =========================
  // SUMMARY BOX
  // =========================
  const summaryY = doc.y;
  const boxWidth = 250;
  const boxX = margin + (pageWidth - boxWidth) / 2;
  
  doc.rect(boxX, summaryY, boxWidth, 50).fillAndStroke("#eff6ff", "#3b82f6");
  
  doc.fillColor("#1e40af").fontSize(9).text("NET SALARY PAYABLE", boxX, summaryY + 10, { align: 'center', width: boxWidth });
  doc.fontSize(14).text(`₹ ${parseFloat(payroll.netSalary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, boxX, summaryY + 24, { align: 'center', width: boxWidth });

  doc.moveDown(2);
  const bottomY = doc.y;
  
  // Left Side: Payment Info
  doc.fillColor("#000").fontSize(9);
  doc.font("Helvetica-Bold").text("Payment Status: ", margin, bottomY);
  doc.font("Helvetica").text(payroll.paymentStatus, margin + 80, bottomY);

  if (payroll.paidDate) {
    doc.font("Helvetica-Bold").text("Disbursment Date: ", margin, bottomY + 12);
    doc.font("Helvetica").text(new Date(payroll.paidDate).toLocaleDateString(), margin + 80, bottomY + 12);
  }

  // =========================
  // FOOTER
  // =========================
  doc.fontSize(8).fillColor("#94a3b8");
  doc.text(
    "This is an electronically generated statement and does not require a physical signature.",
    margin, 730, { align: "center", width: pageWidth }
  );
  doc.text(
    `Generated by XTOWN HRMS - ${new Date().toLocaleString()}`,
    margin, 742, { align: "center", width: pageWidth }
  );
};

export const generatePayslip = (res, payroll, employee, company) => {
  const doc = new PDFDocument({ margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=payslip-${payroll.month}.pdf`
  );

  doc.pipe(res);
  generatePayslipContent(doc, payroll, employee, company);
  doc.end();
};

export const generatePayslipToBuffer = async (payroll, employee, company) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const buffers = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", (err) => reject(err));
    generatePayslipContent(doc, payroll, employee, company);
    doc.end();
  });
};