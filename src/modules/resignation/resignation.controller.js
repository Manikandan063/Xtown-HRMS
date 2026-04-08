import * as resignationService from "./resignation.service.js";
import asyncHandler from "../../shared/asyncHandler.js";

export const applyResignation = asyncHandler(async (req, res) => {
    const resignation = await resignationService.applyResignation(req.body);
    res.status(201).json({
        success: true,
        message: "Resignation applied successfully",
        data: resignation
    });
});

export const approveResignation = asyncHandler(async (req, res) => {
    const resignation = await resignationService.approveResignation(req.params.id);
    res.status(200).json({
        success: true,
        message: "Resignation approved",
        data: resignation
    });
});

export const getResignations = asyncHandler(async (req, res) => {
    const resignations = await resignationService.getResignations();
    res.status(200).json({
        success: true,
        count: resignations.length,
        data: resignations
    });
});

export const calculateSettlement = asyncHandler(async (req, res) => {
    const settlement = await resignationService.calculateSettlement(req.params.id);
    res.status(200).json({
        success: true,
        message: "Final settlement calculated",
        data: settlement
    });
});
