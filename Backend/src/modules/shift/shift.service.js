import * as shiftModel from "./shift.model.js";

export const createShift = async (data) => {
    return await shiftModel.createShift(data);
};

export const assignShiftToEmployee = async (employeeId, shiftId) => {
    return await shiftModel.assignShiftToEmployee(employeeId, shiftId);
};

export const bulkAssignShift = async (employeeIds, shiftId, companyId) => {
    return await shiftModel.bulkAssignShift(employeeIds, shiftId, companyId);
};

export const getAllShifts = async (companyId) => {
    return await shiftModel.getAllShifts(companyId);
};

export const updateShift = async (id, companyId, data) => {
    return await shiftModel.updateShift(id, companyId, data);
};

export const deleteShift = async (id, companyId) => {
    return await shiftModel.deleteShift(id, companyId);
};
