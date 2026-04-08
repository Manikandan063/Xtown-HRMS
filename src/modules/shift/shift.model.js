import { Shift, Employee } from "../../models/initModels.js";

export const createShift = async (data) => {
    const { shiftName, shift_name, startTime, start_time, endTime, end_time, companyId, graceMinutes, fullDayHours, halfDayHours } = data;
    return await Shift.create({
        shiftName: shiftName || shift_name,
        startTime: startTime || start_time,
        endTime: endTime || end_time,
        companyId,
        graceMinutes,
        fullDayHours,
        halfDayHours,
    });
};

export const assignShiftToEmployee = async (employeeId, shiftId) => {
    await Employee.update({ shiftId }, { where: { id: employeeId } });
    return { success: true, message: "Shift assigned successfully" };
};

export const getAllShifts = async (companyId) => {
    const where = companyId ? { companyId } : {};
    return await Shift.findAll({ where });
};
