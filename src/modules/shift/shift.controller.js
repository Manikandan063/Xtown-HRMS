import * as shiftService from "./shift.service.js";
import asyncHandler from "../../shared/asyncHandler.js";

export const createShift = asyncHandler(async (req, res) => {
    const shift = await shiftService.createShift({
        ...req.body,
        companyId: req.user.companyId || req.body.companyId
    });
    res.status(201).json({
        success: true,
        message: "Shift created successfully",
        data: shift
    });
});

export const assignShift = asyncHandler(async (req, res) => {
    const result = await shiftService.assignShiftToEmployee(req.params.employeeId, req.body.shiftId);
    res.status(200).json({
        success: true,
        message: "Shift assigned to employee",
        data: result
    });
});

export const getShifts = asyncHandler(async (req, res) => {
    const shifts = await shiftService.getAllShifts(req.user.companyId);
    res.status(200).json({
        success: true,
        count: shifts.length,
        data: shifts
    });
});
