import { Op } from "sequelize";
import { LeaveType, LeaveRequest, Employee, LeaveBalance, Holiday, Notification, User, Role } from "../../models/initModels.js";
import AppError from "../../shared/utils/appError.js";

// =========================
// CREATE LEAVE TYPE
// =========================
export const createLeaveType = async (data, companyId) => {
  return await LeaveType.create({ ...data, companyId });
};

export const getLeaveTypes = async (companyId) => {
  const types = await LeaveType.findAll({ where: { companyId } });
  const filtered = types.filter(t => t.leaveName !== 'Earned Leave');
  
  if (filtered.length === 0) {
    // Auto-seed if no valid types exist (even if Earned Leave was there)
    const defaults = [
      { leaveName: 'Sick Leave', maxDaysPerYear: 10, companyId },
      { leaveName: 'Casual Leave', maxDaysPerYear: 12, companyId }
    ];
    await LeaveType.bulkCreate(defaults);
    const fresh = await LeaveType.findAll({ where: { companyId } });
    return fresh.filter(t => t.leaveName !== 'Earned Leave');
  }
  
  return filtered;
};

export const deleteLeaveType = async (id) => {
  return await LeaveType.destroy({ where: { id } });
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

  // 3️⃣ Check/Initialize Balance
  let balance = await LeaveBalance.findOne({
    where: { employeeId, leaveTypeId, year: start.getFullYear() }
  });

  if (!balance) {
    const leaveType = await LeaveType.findByPk(leaveTypeId);
    if (!leaveType) throw new AppError("Invalid leave type", 400);
    
    balance = await LeaveBalance.create({
      employeeId,
      leaveTypeId,
      year: start.getFullYear(),
      balance: leaveType.maxDaysPerYear,
      used: 0 // Initialize at zero, increment only on Approval
    });

  }

  const remaining = parseFloat(balance.balance) - parseFloat(balance.used);
  if (remaining < totalDays) {
     throw new AppError(`Insufficient leave balance. Available: ${remaining} days, Requested: ${totalDays} days.`, 400);
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

  const leave = await LeaveRequest.create({
    ...data,
    companyId,
    totalDays,
  });

  // 5️⃣ Notify Admins/HR for "Quick Action"
  try {
    const employee = await Employee.findByPk(employeeId);
    const admins = await User.findAll({
      where: { companyId },
      include: {
        model: Role,
        as: 'role',
        where: { name: { [Op.in]: ['admin', 'hr', 'super_admin'] } }
      }
    });

    const notifPromises = admins.map(admin => Notification.create({
      companyId,
      userId: admin.id,
      title: 'New Leave Request',
      message: `${employee.firstName} ${employee.lastName} has applied for ${totalDays} days of leave.`,
      type: 'LEAVE_REQUEST',
      referenceId: leave.id.toString()
    }));
    await Promise.all(notifPromises);
  } catch (err) {
    console.error('Notification seeding failed:', err.message);
  }

  return leave;
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
          balance.used = Number(balance.used) + leave.totalDays;
          await balance.save();
      }
  }

  leave.status = status;
  leave.approvedBy = approvedBy;
  leave.approvedAt = new Date();

  const updated = await leave.save();

  // 6️⃣ Notify Employee of status change
  try {
    const userToNotify = await User.findOne({ where: { employeeId: leave.employeeId } });
    if (userToNotify) {
      await Notification.create({
        companyId: leave.companyId,
        userId: userToNotify.id,
        title: `Leave Request ${status}`,
        message: `Your leave request for ${leave.totalDays} day(s) has been ${status.toLowerCase()}.`,
        type: 'LEAVE_STATUS_UPDATE'
      });
    }
  } catch (err) {
    console.error('Employee notification failed:', err.message);
  }

  return updated;
};

export const markAsViewed = async (companyId) => {
  if (!companyId) return;
  return await LeaveRequest.update(
    { viewedAt: new Date() },
    { 
      where: { 
        companyId, 
        status: 'Pending', 
        viewedAt: null 
      } 
    }
  );
};

export const markSingleAsViewed = async (id, userId) => {
  const leave = await LeaveRequest.findByPk(id);
  if (leave && !leave.viewedAt) {
    leave.viewedAt = new Date();
    await leave.save();
  }
  return leave;
};

export const getLeaveRequests = async (companyId, query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const offset = (page - 1) * limit;
  const search = query.search || "";
  const status = query.status || "ALL";

  const where = { companyId };

  if (status !== "ALL") {
    where.status = status;
  }

  const employeeInclude = {
    model: Employee,
    attributes: ["firstName", "lastName", "employeeCode"],
    required: !!search // Force INNER JOIN only if searching
  };

  if (search) {
    employeeInclude.where = {
      [Op.or]: [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { employeeCode: { [Op.iLike]: `%${search}%` } }
      ]
    };
  }

  // 🔹 Auto-mark as viewed
  try {
    await markAsViewed(companyId);
  } catch (err) {
    console.warn('[LeaveTracker]: Batch view update failed');
  }

  const { rows, count } = await LeaveRequest.findAndCountAll({
    where,
    limit,
    offset,
    include: [employeeInclude, LeaveType],
    order: [['createdAt', 'DESC']]
  });

  // Fetch status counts for the company
  const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
    LeaveRequest.count({ where: { companyId, status: 'Pending' } }),
    LeaveRequest.count({ where: { companyId, status: 'Approved' } }),
    LeaveRequest.count({ where: { companyId, status: 'Rejected' } })
  ]);

  return {
    total: count,
    page,
    limit,
    data: rows,
    counts: {
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount
    }
  };
};

export const getEmployeeLeaveRequests = async (employeeId, companyId, query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const offset = (page - 1) * limit;
  const status = query.status || "ALL";

  const where = { employeeId, companyId };
  if (status !== "ALL") {
    where.status = status;
  }

  const { rows, count } = await LeaveRequest.findAndCountAll({
    where,
    limit,
    offset,
    include: [Employee, LeaveType],
    order: [['createdAt', 'DESC']]
  });

  const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
    LeaveRequest.count({ where: { employeeId, companyId, status: 'Pending' } }),
    LeaveRequest.count({ where: { employeeId, companyId, status: 'Approved' } }),
    LeaveRequest.count({ where: { employeeId, companyId, status: 'Rejected' } })
  ]);

  return {
    total: count,
    page,
    limit,
    data: rows,
    counts: {
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount
    },
    balances: await LeaveBalance.findAll({
      where: { employeeId, year: new Date().getFullYear() },
      include: [{ model: LeaveType, as: 'leaveType', attributes: ['leaveName'] }]
    })
  };
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