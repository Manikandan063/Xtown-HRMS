import PDFDocument from "pdfkit";

export const generatePayslip = (res, payroll, employee, company) => {
  const doc = new PDFDocument({ margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=payslip-${payroll.month}.pdf`
  );

  doc.pipe(res);

  // =========================
  // HEADER
  // =========================
  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .text(company.companyName, { align: "center" });

  doc
    .fontSize(12)
    .font("Helvetica")
    .text("Corporate Office Address, India", { align: "center" });

  doc.moveDown(1.5);

  doc
    .fontSize(18)
    .font("Helvetica-Bold")
    .text("SALARY PAYSLIP", { align: "center" });

  doc.moveDown();

  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Month: ${payroll.month}`, { align: "right" });

  doc.moveDown(2);

  // =========================
  // EMPLOYEE DETAILS BOX
  // =========================
  doc
    .font("Helvetica-Bold")
    .text("Employee Details", { underline: true });

  doc.moveDown(0.5);

  doc.font("Helvetica");
  doc.text(`Employee Name: ${employee.firstName} ${employee.lastName}`);
  doc.text(`Employee ID: ${employee.id}`);
  doc.text(`Department: ${employee.department || "N/A"}`);
  doc.text(`Designation: ${employee.designation || "N/A"}`);

  doc.moveDown(2);

  // =========================
  // SALARY TABLE HEADER
  // =========================
  const tableTop = doc.y;

  doc.font("Helvetica-Bold");
  doc.text("Earnings", 50, tableTop);
  doc.text("Amount (₹)", 200, tableTop);
  doc.text("Deductions", 320, tableTop);
  doc.text("Amount (₹)", 470, tableTop);

  doc.moveDown();
  doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();

  doc.moveDown();

  // =========================
  // SALARY ROW
  // =========================
  doc.font("Helvetica");

  const rowY = doc.y;

  doc.text("Basic Salary", 50, rowY);
  doc.text(payroll.basicSalary.toString(), 200, rowY);

  doc.text("Other Deductions", 320, rowY);
  doc.text(payroll.deductions.toString(), 470, rowY);

  doc.moveDown(1.5);

  doc.text("Allowances", 50, doc.y);
  doc.text(payroll.allowances.toString(), 200, doc.y);

  doc.moveDown(2);

  doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();

  doc.moveDown(2);

  // =========================
  // NET SALARY SECTION
  // =========================
  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .text(`Net Salary: ₹ ${payroll.netSalary}`, {
      align: "center",
    });

  doc.moveDown(2);

  // =========================
  // PAYMENT INFO
  // =========================
  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Payment Status: ${payroll.paymentStatus}`);

  doc.text(`Paid Date: ${payroll.paidDate}`);

  doc.moveDown(3);

  // =========================
  // FOOTER
  // =========================
  doc
    .fontSize(10)
    .text("This is a computer-generated payslip and does not require signature.", {
      align: "center",
    });

  doc.end();
};