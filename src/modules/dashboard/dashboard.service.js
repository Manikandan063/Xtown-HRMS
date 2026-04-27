import { Op } from "sequelize";
import { sequelize } from "../../config/db.js";
import { Employee, AttendanceDaily, LeaveRequest, Payroll, Company, LeaveBalance, LeaveType, SubscriptionRequest, Shift, Designation, Resignation } from "../../models/initModels.js";

export const getDashboardSummaryService = async (companyId, user) => {
  const role = String(user.role || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const today = new Date().toISOString().split("T")[0];
  const currentMonth = today.slice(0, 7);

  // 1. Fetch Personal Data (Common for all roles' profile pages)
  let employee = await Employee.findOne({ 
    where: { 
      [Op.or]: [
        { officialEmail: user.email },
        { id: user.employeeId || null }
      ]
    }, 
    include: [
      'personalDetail', 
      'contactDetail', 
      'legalDetail', 
      'salary', 
      'assets',
      'emergencyContacts',
      'bankDetail',
      'certifications',
      'designation',
      'department',
      Shift
    ] 
  });

  // Fallback for SuperAdmins/Admins without Employee record
  if (!employee && (role === 'superadmin' || role === 'admin')) {
    employee = {
      id: user.userId,
      firstName: user.name?.split(' ')[0] || 'Admin',
      lastName: user.name?.split(' ').slice(1).join(' ') || 'User',
      officialEmail: user.email,
      employeeCode: 'ADMIN-SITE',
      designation: { name: user.designation || (role === 'superadmin' ? 'System Owner' : 'Administrator') }
    };
  }
  
  const empId = employee?.id || user.userId;

  // 2. Logic based on ROLES
  
  // SUPER ADMIN / PROJECT OWNER
  if (role === 'superadmin') {
    const totalCompanies = await Company.count();
    const activeSubscriptions = await Company.count({ 
      where: { subscriptionPlan: { [Op.ne]: 'BASIC' }, isActive: true } 
    });
    const inactiveCompanies = await Company.count({ where: { isActive: false } });
    
    // Calculate Total Revenue from approved requests
    const totalRevenue = await SubscriptionRequest.sum("price", { where: { status: 'APPROVED' } });
    
    const totalEmployees = await Employee.count();
    const presentToday = await AttendanceDaily.count({ where: { date: today, status: "PRESENT" } });
    const onLeaveToday = await LeaveRequest.count({
      where: { status: "Approved", fromDate: { [Op.lte]: today }, toDate: { [Op.gte]: today } }
    });
    const payrollThisMonth = await Payroll.sum("netSalary", { where: { month: currentMonth } });
    
    // 1. Plan Distribution
    const planDistribution = await Company.findAll({
      attributes: [
        ['subscriptionPlan', 'name'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'value']
      ],
      group: ['subscriptionPlan'],
      raw: true
    }).then(results => results.map(r => ({
      name: r.name || 'BASIC',
      value: parseInt(r.value)
    })));

    return { 
      personalData: employee,
      totalCompanies, 
      activeSubscriptions,
      expiredSubscriptions: inactiveCompanies,
      totalRevenue: totalRevenue || 0,
      totalEmployees,
      presentToday,
      onLeaveToday,
      payrollThisMonth: payrollThisMonth || 0,
      systemStatus: 'Healthy',
      planDistribution
    };
  }

  // COMPANY ADMIN / HR
  if (role === 'admin') {
    const totalEmployees = await Employee.count({ where: { companyId } });
    const activeEmployees = await Employee.count({ where: { companyId, status: "ACTIVE" } });
    const presentToday = await AttendanceDaily.count({ where: { companyId, date: today, status: "PRESENT" } });
    const onLeaveToday = await LeaveRequest.count({
      where: { companyId, status: "Approved", fromDate: { [Op.lte]: today }, toDate: { [Op.gte]: today } }
    });
    const payrollThisMonth = await Payroll.sum("netSalary", { where: { companyId, month: currentMonth } });
    
    // 1. Employee Distribution by Designation
    const employeeDistribution = await Employee.findAll({
      where: { companyId },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Employee.id')), 'count'],
      ],
      include: [{
        model: Designation,
        as: 'designation',
        attributes: ['name']
      }],
      group: ['designation.id', 'designation.name'],
      raw: true
    }).then(results => results.map(r => ({
      name: r['designation.name'] || 'Unassigned',
      value: parseInt(r.count)
    })));

    // 2. Attendance Overview (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const last7DaysAttendance = await AttendanceDaily.findAll({
      where: {
        companyId,
        date: { [Op.gte]: sevenDaysAgo.toISOString().split('T')[0] }
      },
      attributes: ['date', 'status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['date', 'status'],
      raw: true
    });

    const attendanceTrends = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const present = last7DaysAttendance.find(a => a.date === dateStr && a.status === 'PRESENT')?.count || 0;
      const absent = last7DaysAttendance.find(a => a.date === dateStr && a.status === 'ABSENT')?.count || 0;
      attendanceTrends.push({ 
        date: dateStr, 
        present: parseInt(present),
        absent: parseInt(absent)
      });
    }

    // 3. Leave Request Status
    const leaveStatusDistribution = await LeaveRequest.findAll({
      where: { companyId },
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true
    }).then(results => results.map(r => ({
      name: r.status,
      value: parseInt(r.count)
    })));

    // 4. Resignation & New Employees
    const resignationsCount = await Resignation.count({ where: { companyId } });
    const newEmployeesThisMonth = await Employee.count({
      where: {
        companyId,
        createdAt: { [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      }
    });

    const resignationStatusDistribution = await Resignation.findAll({
       where: { companyId },
       attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
       group: ['status'],
       raw: true
    }).then(results => results.map(r => ({
       name: r.status,
       value: parseInt(r.count)
    })));

    const company = await Company.findByPk(companyId, {
      attributes: ['subscriptionPlan', 'planExpiryDate', 'isActive']
    });

    return { 
      personalData: employee,
      companySubscription: company,
      totalEmployees, 
      activeEmployees, 
      presentToday, 
      onLeaveToday, 
      payrollThisMonth: payrollThisMonth || 0,
      employeeDistribution,
      attendanceTrends,
      leaveStatusDistribution,
      resignationStatusDistribution,
      newHiresCount: newEmployeesThisMonth
    };
  }

  // REGULAR EMPLOYEE
  if (role === 'user' || role === 'employee') {
    const leaveBalances = await LeaveBalance.findAll({ 
      where: { employeeId: empId, year: new Date().getFullYear() },
      include: [{ model: LeaveType, as: 'leaveType', attributes: ['leaveName', 'maxDaysPerYear'] }]
    });
    
    const recentPayrolls = await Payroll.findAll({ 
      where: { employeeId: empId }, 
      limit: 5, 
      order: [['createdAt', 'DESC']] 
    });
    
    return { 
      personalData: employee, 
      leaveBalances, 
      recentPayrolls 
    };
  }

  return { 
    personalData: employee,
    message: "Role mapping processed: " + role 
  };
};

/**
 * Aggregates all organizational data for a comprehensive system backup.
 * Captures Employee lifecycle, Attendance, Payroll, and Resignations.
 */
export const exportAllDataService = async (companyId, user) => {
  const role = String(user.role || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  
  // Security check: Only Admins can export full data
  if (role !== 'admin' && role !== 'superadmin') {
    throw new Error("Unauthorized: Full data export is restricted to administrators.");
  }

  const isSuperAdmin = role === 'superadmin';
  const filter = isSuperAdmin ? {} : { companyId };


  // Fetch all core modules in parallel for efficiency
  const [
    employees,
    attendance,
    leaves,
    payroll,
    resignations,
    shifts,
    designations,
    company
  ] = await Promise.all([
    Employee.findAll({ 
      where: filter, 
      include: [
        { model: Designation, as: 'designation', attributes: ['name'] },
        { model: Shift, attributes: ['shiftName'] },
        'personalDetail', 'contactDetail', 'legalDetail', 'salary', 'bankDetail'
      ] 
    }),

    AttendanceDaily.findAll({ 
      where: filter,
      include: [{ model: Employee, attributes: ['firstName', 'lastName', 'employeeCode'] }]
    }),
    LeaveRequest.findAll({ 
      where: filter,
      include: [{ model: Employee, attributes: ['firstName', 'lastName', 'employeeCode'] }]
    }),
    Payroll.findAll({ 
      where: filter,
      include: [{ model: Employee, attributes: ['firstName', 'lastName', 'employeeCode'] }]
    }),
    Resignation.findAll({ 
      where: filter,
      include: [{ model: Employee, as: 'employee', attributes: ['firstName', 'lastName', 'employeeCode'] }]
    }),
    Shift.findAll({ where: filter }),
    Designation.findAll({ where: filter }),
    Company.findByPk(companyId)
  ]);

  // Transform data to be Excel-friendly (resolve IDs to names)
  const formatEmployee = (emp) => ({
    ...emp.toJSON(),
    designation: emp.designation?.name || 'N/A',
    shift: emp.Shift?.shiftName || 'N/A',
    fullName: `${emp.firstName} ${emp.lastName}`
  });


  const formatWithEmployee = (item) => {
    const json = item.toJSON();
    const emp = json.Employee || json.employee; // Handle both cases (alias or no alias)
    return {
      ...json,
      employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'N/A',
      employeeCode: emp?.employeeCode || 'N/A'
    };
  };


  return {
    metadata: {
      exportedAt: new Date().toISOString(),
      exportedBy: user.email,
      company: company?.companyName || 'Global Console'
    },
    data: {
      employees: employees.map(formatEmployee),
      attendanceHistory: attendance.map(formatWithEmployee),
      leaveRequests: leaves.map(formatWithEmployee),
      payrollRecords: payroll.map(formatWithEmployee),
      resignationLogs: resignations.map(formatWithEmployee),
      operationalShifts: shifts,
      designationMatrix: designations
    }
  };
};