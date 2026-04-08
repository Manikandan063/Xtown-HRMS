import express from "express";
import * as leaveController from "./leave.controller.js";
import authMiddleware from "../../shared/middlewares/auth.js";

const router = express.Router();

router.use(authMiddleware);

// Leave Type
router.post("/type", leaveController.createLeaveType);
router.get("/type", leaveController.getLeaveTypes);

// Leave Request
router.post("/request", leaveController.createLeaveRequest);
router.get("/request", leaveController.getLeaveRequests);
router.patch("/request/:id/status", leaveController.updateLeaveStatus);

// Holidays
router.post("/holidays", async (req, res) => {
    const { addHoliday } = await import("./holiday.model.js");
    const h = await addHoliday({ ...req.body, company_id: req.user.companyId });
    res.status(201).json({ success: true, data: h });
});

router.get("/holidays", async (req, res) => {
    const { getHolidays } = await import("./holiday.model.js");
    const h = await getHolidays(req.user.companyId);
    res.status(200).json({ success: true, data: h });
});

// Balance Credit
router.post("/credit-balance", async (req, res) => {
    const { creditMonthlyLeaves } = await import("./leave.service.js");
    await creditMonthlyLeaves(req.user.companyId);
    res.status(200).json({ success: true, message: "Leaves credited" });
});

export default router;