import express from "express";
import * as payrollController from "./payroll.controller.js";
import { checkRole } from "../../shared/middlewares/role.js";
import authMiddleware from "../../shared/middlewares/auth.js";
import { isHR, isHRorMD } from "../../shared/middlewares/designation.js";

const router = express.Router();

router.use(authMiddleware);

// MD / HR can see the summary
router.get("/summary", checkRole("SUPER_ADMIN", "ADMIN"), isHRorMD, payrollController.getPayrollSummary);

// HR has full control over processing payroll and updating status
router.post("/create", checkRole("SUPER_ADMIN", "ADMIN"), isHR, payrollController.createPayroll);
router.patch("/status/:id", checkRole("SUPER_ADMIN", "ADMIN"), isHR, payrollController.updatePaymentStatus);

// Common GET routes for HR/MD (read-only for MD)
router.get("/company", checkRole("SUPER_ADMIN", "ADMIN"), payrollController.getCompanyPayrolls);
router.get("/employee/:employeeId", checkRole("SUPER_ADMIN", "ADMIN", "USER"), payrollController.getEmployeePayrolls);
router.get("/payslip/:id", checkRole("SUPER_ADMIN", "ADMIN", "USER"), payrollController.downloadPayslip);

// Salary Adjustments
router.post("/adjustments", checkRole("SUPER_ADMIN", "ADMIN"), isHR, async (req, res) => {
    const { addAdjustment } = await import("./salaryAdjustment.model.js");
    const adj = await addAdjustment(req.body);
    res.status(201).json({ success: true, data: adj });
});

export default router;