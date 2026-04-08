import { Document } from "../../models/initModels.js";

export const uploadDocument = async (data) => {
    const { employeeId, documentType, fileUrl } = data;
    return await Document.create({
        employeeId,
        documentType,
        fileUrl
    });
};

export const getDocumentsByEmployee = async (employeeId) => {
    return await Document.findAll({ where: { employeeId } });
};
