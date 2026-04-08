import { Op } from "sequelize";
import { Employee, AttendanceDaily, LeaveRequest, Payroll, Company, LeaveBalance } from "../../models/initModels.js";

export const getDashboardSummaryService = async (companyId, user) => {
  const role = user.role;
  const today = new Date().toISOString().split("T")[0];
  const currentMonth = today.slice(0, 7);

  if (role === 'SUPER_ADMIN' || role === 1) {
    const totalCompanies = await Company.count();
    const totalEmployees = await Employee.count();
    // System stats example
    return { totalCompanies, totalEmployees, systemStatus: 'Healthy' };
  }

  if (role === 'ADMIN' || role === 2) {
    const totalEmployees = await Employee.count({ where: { companyId } });
    const activeEmployees = await Employee.count({ where: { companyId, status: "ACTIVE" } });
    const presentToday = await AttendanceDaily.count({ where: { companyId, date: today, status: "PRESENT" } });
    const onLeaveToday = await LeaveRequest.count({
      where: { companyId, status: "Approved", fromDate: { [Op.lte]: today }, toDate: { [Op.gte]: today } }
    });
    const payrollThisMonth = await Payroll.sum("netSalary", { where: { companyId, month: currentMonth } });
    return { totalEmployees, activeEmployees, presentToday, onLeaveToday, payrollThisMonth: payrollThisMonth || 0 };
  }

  if (role === 'USER' || role === 3) {
    const employee = await Employee.findOne({ where: { id: user.employeeId }, include: ['personalDetail', 'salary'] });
    const leaveBalances = await LeaveBalance.findAll({ where: { employeeId: user.employeeId, year: new Date().getFullYear() } });
    const recentPayrolls = await Payroll.findAll({ where: { employeeId: user.employeeId }, limit: 5, order: [['createdAt', 'DESC']] });
    return { personalData: employee, leaveBalances, recentPayrolls };
  }

  return { message: "Role not recognized" };
};