import * as shiftModel from "./shift.model.js";

export const createShift = async (data) => {
    return await shiftModel.createShift(data);
};

export const assignShiftToEmployee = async (employeeId, shiftId) => {
    return await shiftModel.assignShiftToEmployee(employeeId, shiftId);
};

export const getAllShifts = async (companyId) => {
    return await shiftModel.getAllShifts(companyId);
};
