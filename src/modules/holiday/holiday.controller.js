import * as holidayService from "./holiday.service.js";
import asyncHandler from "../../shared/utils/asyncHandler.js";

export const getHolidays = asyncHandler(async (req, res) => {
    const holidays = await holidayService.getAllHolidays(req.user.companyId);
    res.status(200).json({
        success: true,
        data: holidays
    });
});

export const createHoliday = asyncHandler(async (req, res) => {
    const holiday = await holidayService.createHoliday({
        ...req.body,
        companyId: req.user.companyId
    });
    res.status(201).json({
        success: true,
        message: "Holiday established successfully",
        data: holiday
    });
});

export const updateHoliday = asyncHandler(async (req, res) => {
    await holidayService.updateHoliday(req.params.id, req.user.companyId, req.body);
    res.status(200).json({
        success: true,
        message: "Holiday parameters updated"
    });
});

export const deleteHoliday = asyncHandler(async (req, res) => {
    await holidayService.deleteHoliday(req.params.id, req.user.companyId);
    res.status(200).json({
        success: true,
        message: "Holiday archived"
    });
});

export const populateDefaults = asyncHandler(async (req, res) => {
    const { year } = req.body;
    const result = await holidayService.populateDefaultHolidays(req.user.companyId, year || new Date().getFullYear());
    res.status(200).json({
        success: true,
        message: "Holiday registry synchronized with standard policies",
        count: result.length
    });
});
