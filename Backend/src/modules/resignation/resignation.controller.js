import * as resignationService from "./resignation.service.js";
import asyncHandler from "../../shared/utils/asyncHandler.js";

export const applyResignation = asyncHandler(async (req, res) => {
    const resignation = await resignationService.applyResignation(req.body, req.user);
    res.status(201).json({
        success: true,
        message: "Resignation applied successfully",
        data: resignation
    });
});

export const getResignations = asyncHandler(async (req, res) => {
    const resignations = await resignationService.getResignations(req.user.companyId, req.query);
    res.status(200).json({
        success: true,
        data: resignations
    });
});

export const getMyResignation = asyncHandler(async (req, res) => {
    const resignation = await resignationService.getMyResignation(req.user.employeeId);
    res.status(200).json({
        success: true,
        data: resignation
    });
});

export const updateResignationStatus = asyncHandler(async (req, res) => {
    const resignation = await resignationService.updateResignationStatus(req.params.id, req.body.status, req.user.companyId);
    res.status(200).json({
        success: true,
        message: `Resignation ${req.body.status.toLowerCase()}`,
        data: resignation
    });
});

export const updateChecklistItem = asyncHandler(async (req, res) => {
    const item = await resignationService.updateChecklistItem(req.params.id, req.body);
    res.status(200).json({
        success: true,
        message: "Checklist item updated",
        data: item
    });
});

export const completeExit = asyncHandler(async (req, res) => {
    const result = await resignationService.completeExit(req.params.id, req.user.companyId);
    res.status(200).json({
        success: true,
        ...result
    });
});

export const updateResignation = asyncHandler(async (req, res) => {
    const resignation = await resignationService.updateResignation(req.params.id, req.body, req.user.companyId);
    res.status(200).json({
        success: true,
        message: "Resignation updated successfully",
        data: resignation
    });
});

export const getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await resignationService.getDashboardStats(req.user.companyId);
    res.status(200).json({
        success: true,
        data: stats
    });
});

export const cancelResignation = asyncHandler(async (req, res) => {
    const isAdmin = ['admin', 'super_admin', 'hr'].includes(req.user.role?.toLowerCase());
    const result = await resignationService.cancelResignation(
        req.params.id, 
        req.user.companyId, 
        isAdmin, 
        isAdmin ? null : req.user.employeeId
    );
    res.status(200).json({
        success: true,
        ...result
    });
});
