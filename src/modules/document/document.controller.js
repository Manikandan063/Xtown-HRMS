import * as documentService from "./document.service.js";
import asyncHandler from "../../shared/asyncHandler.js";

export const uploadDocument = asyncHandler(async (req, res) => {
    const document = await documentService.uploadDocument(req.body);
    res.status(201).json({
        success: true,
        message: "Document uploaded successfully",
        data: document
    });
});

export const getEmployeeDocs = asyncHandler(async (req, res) => {
    const documents = await documentService.getDocumentsByEmployee(req.params.employeeId);
    res.status(200).json({
        success: true,
        count: documents.length,
        data: documents
    });
});
