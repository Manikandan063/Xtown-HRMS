import { Op } from "sequelize";
import { LeaveType, LeaveRequest, Employee, LeaveBalance, Holiday } from "../../models/initModels.js";
import AppError from "../../shared/appError.js";

// =========================
// CREATE LEAVE TYPE
// =========================
export const createLeaveType = async (data, companyId) => {
  return await LeaveType.create({ ...data, companyId });
};

export const getLeaveTypes = async (companyId) => {
  return await LeaveType.findAll({ where: { companyId } });
};

// =========================
// CREATE LEAVE REQUEST
// =========================
export const createLeaveRequest = async (data, companyId) => {
  const { employeeId, leaveTypeId, fromDate, toDate } = data;

  const start = new Date(fromDate);
  const end = new Date(toDate);

  if (start > end) {
    throw new AppError("From date cannot be after To date", 400);
  }

  // 1️⃣ Fetch Holidays using Sequelize
  const holidays = await Holiday.findAll({
    where: {
      companyId,
      holidayDate: { [Op.between]: [fromDate, toDate] }
    }
  });
  
  const holidayDates = holidays.map(h => h.holidayDate);

  // 2️⃣ Calculate work days (skipping holidays)
  let totalDays = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    if (!holidayDates.includes(dateStr)) {
      totalDays++;
    }
  }

  if (totalDays === 0) {
    throw new AppError("Applied dates are all holidays", 400);
  }

  // 3️⃣ Check Balance
  const balance = await LeaveBalance.findOne({
    where: { employeeId, leaveTypeId, year: start.getFullYear() }
  });

  if (!balance || (parseFloat(balance.balance) - parseFloat(balance.used)) < totalDays) {
     throw new AppError("Insufficient leave balance", 400);
  }

  // 4️⃣ Prevent overlapping leave
  const overlap = await LeaveRequest.findOne({
    where: {
      employeeId,
      status: { [Op.ne]: "Rejected" },
      [Op.or]: [
        { fromDate: { [Op.between]: [fromDate, toDate] } },
        { toDate: { [Op.between]: [fromDate, toDate] } },
      ],
    },
  });

  if (overlap) {
    throw new AppError("Leave already applied for selected dates", 400);
  }

  return await LeaveRequest.create({
    ...data,
    companyId,
    totalDays,
  });
};

// =========================
// UPDATE LEAVE STATUS (Auto-deduct)
// =========================
export const updateLeaveStatus = async (id, status, approvedBy) => {
  const leave = await LeaveRequest.findByPk(id);
  if (!leave) throw new AppError("Leave not found", 404);
  if (leave.status !== "Pending") throw new AppError("Leave already processed", 400);

  if (status === "Approved") {
      // Deduct from balance
      const balance = await LeaveBalance.findOne({
          where: { employeeId: leave.employeeId, leaveTypeId: leave.leaveTypeId, year: new Date(leave.fromDate).getFullYear() }
      });
      if (balance) {
          balance.used = parseFloat(balance.used) + parseFloat(leave.totalDays);
          await balance.save();
      }
  }

  leave.status = status;
  leave.approvedBy = approvedBy;
  leave.approvedAt = new Date();

  return await leave.save();
};

export const getLeaveRequests = async (companyId) => {
  return await LeaveRequest.findAll({
    where: { companyId },
    include: [Employee, LeaveType],
  });
};

// =========================
// MONTHLY CREDIT SYSTEM
// =========================
export const creditMonthlyLeaves = async (companyId) => {
    const leaveTypes = await LeaveType.findAll({ where: { companyId, isActive: true } });
    const employees = await Employee.findAll({ where: { companyId, status: 'ACTIVE' } });
    const currentYear = new Date().getFullYear();

    for (const employee of employees) {
        for (const lt of leaveTypes) {
            const [balance, created] = await LeaveBalance.findOrCreate({
                where: { employeeId: employee.id, leaveTypeId: lt.id, year: currentYear },
                defaults: { balance: 0, used: 0 }
            });
            // Example: credit 1.5 days per month
            balance.balance = parseFloat(balance.balance) + 1.5;
            await balance.save();
        }
    }
};