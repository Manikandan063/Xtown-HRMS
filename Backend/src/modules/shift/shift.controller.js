import * as shiftService from "./shift.service.js";
import asyncHandler from "../../shared/utils/asyncHandler.js";

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

export const bulkAssignShift = asyncHandler(async (req, res) => {
    const { employeeIds, shiftId } = req.body;
    await shiftService.bulkAssignShift(employeeIds, shiftId, req.user.companyId);
    res.status(200).json({
        success: true,
        message: "Shifts allotted to selected personnel"
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

export const updateShift = asyncHandler(async (req, res) => {
    await shiftService.updateShift(req.params.id, req.user.companyId, req.body);
    res.status(200).json({
        success: true,
        message: "Shift updated successfully"
    });
});

export const deleteShift = asyncHandler(async (req, res) => {
    await shiftService.deleteShift(req.params.id, req.user.companyId);
    res.status(200).json({
        success: true,
        message: "Shift deleted successfully"
    });
});
