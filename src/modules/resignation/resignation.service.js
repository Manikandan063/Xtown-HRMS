import { sequelize } from "../../config/db.js";
import { Employee, EmployeeSalary, Resignation, SalaryAdjustment } from "../../models/initModels.js";
import AppError from "../../shared/appError.js";
import { Op } from "sequelize";

export const applyResignation = async (data) => {
    const { employeeId, companyId, reason, noticePeriod, lastWorkingDate } = data;
    
    // Create resignation using Sequelize
    const resignation = await Resignation.create({
        employeeId,
        companyId,
        reason,
        noticePeriod,
        lastWorkingDate
    });
    
    // Update employee status to 'RESIGNED'
    await Employee.update({ status: 'RESIGNED' }, { where: { id: employeeId } });
    
    return resignation;
};

export const approveResignation = async (id) => {
    const resignation = await Resignation.findByPk(id);
    if (!resignation) throw new AppError("Resignation not found", 404);
    
    resignation.status = 'approved';
    await resignation.save();
    
    return resignation;
};

export const calculateSettlement = async (resignationId) => {
    // 1. Fetch Resignation
    const resignation = await Resignation.findByPk(resignationId);
    if (!resignation) throw new AppError("Resignation not found", 404);

    const employeeId = resignation.employeeId;

    // 2. Fetch Employee Salary Structure
    const salary = await EmployeeSalary.findOne({ where: { employeeId } });
    if (!salary) throw new AppError("Salary structure not found", 404);

    // 3. Fetch Adjustments (using built-in sum or find)
    const adjustments = await SalaryAdjustment.findAll({ where: { employeeId } });
    const totalAdjustments = adjustments.reduce((acc, curr) => {
        return curr.type === 'increment' ? acc + parseFloat(curr.amount) : acc - parseFloat(curr.amount);
    }, 0);

    // 4. Calculate Pending Salary
    const pendingSalary = parseFloat(salary.netSalary);

    // 5. Hardcoded or Placeholder Deductions
    const leaveDeductions = 0; 

    const finalSettlementAmount = pendingSalary + totalAdjustments - leaveDeductions;

    // 6. Update Resignation record
    resignation.finalSettlementAmount = finalSettlementAmount;
    resignation.settlementStatus = 'completed';
    await resignation.save();
    
    return resignation;
};

export const getResignations = async () => {
    return await Resignation.findAll();
};
