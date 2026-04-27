import { sequelize } from "../../config/db.js";
import { Employee, Resignation, ExitChecklist, User, Company, Department, Designation, EmployeeAsset } from "../../models/initModels.js";
import AppError from "../../shared/utils/appError.js";
import { Op } from "sequelize";
import { sendEmail } from "../../shared/utils/emailSender.js";
import { createNotification } from "../notification/notification.service.js";

export const applyResignation = async (data, user) => {
    const { reason, noticePeriod, lastWorkingDate, comments } = data;
    const employeeId = user.employeeId;
    const companyId = user.companyId;

    if (!employeeId) throw new AppError("Only employees can apply for resignation", 400);

    const employee = await Employee.findByPk(employeeId);
    if (!employee) throw new AppError("Employee profile not found", 404);

    // 🔒 Security Check: Controlled Visibility
    if (employee.canResign !== true) {
      throw new AppError("Resignation access not enabled. Contact HR.", 403);
    }

    // Check if already applied
    const existing = await Resignation.findOne({
        where: { employeeId, status: { [Op.in]: ['pending', 'approved'] } }
    });
    if (existing) throw new AppError("You already have an active resignation request", 400);

    // Create resignation
    const resignation = await Resignation.create({
        employeeId,
        companyId,
        reason,
        comments,
        noticePeriod: noticePeriod || 30, // Default 30 days
        lastWorkingDate,
        resignationDate: new Date(),
        status: 'pending'
    });

    // We no longer update employee status to RESIGNED here. 
    // It will only change once the Admin APPROVES the request.
    // await Employee.update({ status: 'RESIGNED' }, { where: { id: employeeId } });

    try {
        const company = await Company.findByPk(companyId);
        const admins = await User.findAll({
            where: { companyId, role_id: { [Op.in]: [2] } } // Assuming 2 is ADMIN
        });

        const employee = await Employee.findByPk(employeeId);
        for (const admin of admins) {
            // Email notification
            await sendEmail(
                admin.email,
                `[${company.name}] New Resignation Request`,
                `A new resignation request has been submitted by ${employee.firstName} ${employee.lastName}.`,
                `<p>A new resignation request has been submitted by <b>${employee.firstName} ${employee.lastName}</b>.</p>
                 <p><b>Company:</b> ${company.name}</p>
                 <p><b>Reason:</b> ${reason}</p>
                 <p><b>Last Working Day:</b> ${lastWorkingDate}</p>`,
                [],
                company.name
            );

            // In-app notification
            await createNotification({
                companyId,
                userId: admin.id,
                title: "New Resignation Request",
                message: `${employee.firstName} ${employee.lastName} (${employee.employeeCode}) has submitted a resignation request.`,
                type: "RESIGNATION",
                referenceId: resignation.id
            });
        }
    } catch (error) {
        console.error("Failed to send resignation notifications:", error.message);
    }

    return resignation;
};

export const getResignations = async (companyId, filters = {}) => {
    const where = { companyId };
    if (filters.status) where.status = filters.status;

    return await Resignation.findAll({
        where,
        include: [
            { 
                model: Employee, 
                as: 'employee', 
                attributes: ['firstName', 'lastName', 'employeeCode', 'officialEmail'],
                include: [
                    { model: Department, as: 'department', attributes: ['name'] },
                    { model: Designation, as: 'designation', attributes: ['name'] },
                    { model: EmployeeAsset, as: 'assets' }
                ]
            },
            { model: ExitChecklist, as: 'checklistItems' }
        ],
        order: [['createdAt', 'DESC']]
    });
};

export const getMyResignation = async (employeeId) => {
    return await Resignation.findOne({
        where: { employeeId },
        include: [{ model: ExitChecklist, as: 'checklistItems' }],
        order: [['createdAt', 'DESC']]
    });
};

export const updateResignationStatus = async (id, status, companyId) => {
    const resignation = await Resignation.findOne({
        where: { id, companyId },
        include: [
            { model: Employee, as: 'employee' },
            { model: Company, as: 'company' }
        ]
    });
    if (!resignation) throw new AppError("Resignation not found", 404);

    resignation.status = status;
    await resignation.save();

    // If rejected, revert employee status to ACTIVE
    if (status === 'rejected') {
        await Employee.update({ status: 'ACTIVE' }, { where: { id: resignation.employeeId } });
    }

    // If approved, update employee status to RESIGNED and trigger exit process (checklist)
    if (status === 'approved') {
        await Employee.update({ status: 'RESIGNED' }, { where: { id: resignation.employeeId } });
        
        const tasks = [
            "Laptop return",
            "ID card submission",
            "Knowledge transfer",
            "Final settlement"
        ];
        
        const checklistItems = tasks.map(task => ({
            resignationId: resignation.id,
            task,
            status: 'pending'
        }));

        await ExitChecklist.bulkCreate(checklistItems);
    }

    try {
        const subject = `Resignation Request ${status.toUpperCase()}`;
        const message = `Hi ${resignation.employee.firstName} ${resignation.employee.lastName} (${resignation.employee.employeeCode}), your resignation request has been ${status.toLowerCase()}.`;
        
        // Find User ID for the employee to send in-app notification
        const employeeUser = await User.findOne({ where: { employeeId: resignation.employeeId } });
        
        if (employeeUser) {
            await createNotification({
                companyId,
                userId: employeeUser.id,
                title: subject,
                message: message,
                type: "RESIGNATION_UPDATE",
                referenceId: resignation.id
            });
        }

        await sendEmail(
            resignation.employee.officialEmail,
            `[${resignation.company.name}] Resignation Request ${status.toUpperCase()}`,
            message,
            `<p>Hi <b>${resignation.employee.firstName} ${resignation.employee.lastName}</b>,</p>
             <p>Your resignation request (ID: ${resignation.employee.employeeCode}) at <b>${resignation.company.name}</b> has been <b>${status.toUpperCase()}</b>.</p>
             ${status === 'approved' ? `<p>Your last working day is set as <b>${resignation.lastWorkingDate}</b>.</p>` : ''}
             <p>Regards,<br/>HR Department<br/><b>${resignation.company.name}</b></p>`,
            [],
            resignation.company.name
        );
    } catch (error) {
        console.error("Failed to send resignation status update notifications:", error.message);
    }

    return resignation;
};

export const updateChecklistItem = async (id, data) => {
    const item = await ExitChecklist.findByPk(id);
    if (!item) throw new AppError("Checklist item not found", 404);

    item.status = data.status || item.status;
    item.remarks = data.remarks || item.remarks;
    if (data.status === 'COMPLETED') {
        item.completedAt = new Date();
    }
    await item.save();
    return item;
};

export const completeExit = async (resignationId, companyId) => {
    const resignation = await Resignation.findOne({
        where: { id: resignationId, companyId },
        include: [{ model: Employee, as: 'employee' }]
    });
    if (!resignation) throw new AppError("Resignation not found", 404);

    // Check if all checklist items are completed
    const pendingItems = await ExitChecklist.count({
        where: { resignationId, status: 'pending' }
    });
    if (pendingItems > 0) throw new AppError("All checklist items must be completed before final exit", 400);

    // Mark Employee as EXITED
    await Employee.update({ status: 'EXITED' }, { where: { id: resignation.employeeId } });
    
    // Disable User login
    await User.update({ is_active: false }, { where: { employeeId: resignation.employeeId } });

    resignation.status = 'completed';
    await resignation.save();

    return { message: "Employee exit completed and login disabled" };
};

export const updateResignation = async (id, data, companyId) => {
    const resignation = await Resignation.findOne({ where: { id, companyId } });
    if (!resignation) throw new AppError("Resignation not found", 404);

    if (data.noticePeriod) resignation.noticePeriod = data.noticePeriod;
    if (data.lastWorkingDate) resignation.lastWorkingDate = data.lastWorkingDate;
    if (data.finalSettlementAmount !== undefined) resignation.finalSettlementAmount = data.finalSettlementAmount;
    if (data.settlementStatus) resignation.settlementStatus = data.settlementStatus;
    if (data.settlementBreakdown) resignation.settlementBreakdown = data.settlementBreakdown;
    
    await resignation.save();
    return resignation;
};

export const getDashboardStats = async (companyId) => {
    const total = await Resignation.count({ where: { companyId } });
    const pending = await Resignation.count({ where: { companyId, status: 'pending' } });
    const inNotice = await Resignation.count({ where: { companyId, status: 'approved' } });
    const completed = await Resignation.count({ where: { companyId, status: 'completed' } });

    return {
        total,
        pending,
        inNotice,
        completed
    };
};

export const cancelResignation = async (id, companyId, isAdmin = false, employeeId = null) => {
    const where = { id, companyId };
    if (!isAdmin) {
        where.employeeId = employeeId;
        where.status = 'pending';
    }

    const resignation = await Resignation.findOne({ where, include: [{ model: Employee, as: 'employee' }] });
    if (!resignation) throw new AppError("Resignation not found or cannot be cancelled", 400);

    const affectedEmployeeId = resignation.employeeId;
    const employeeEmail = resignation.employee.officialEmail;
    const employeeName = `${resignation.employee.firstName} ${resignation.employee.lastName}`;
    const employeeCode = resignation.employee.employeeCode;

    await resignation.destroy();

    // Always revert employee status to ACTIVE when cancelled by anyone
    await Employee.update({ status: 'ACTIVE' }, { where: { id: affectedEmployeeId } });

    // Send notifications if cancelled by Admin
    if (isAdmin) {
        try {
            const company = await Company.findByPk(companyId);
            const subject = `[${company.name}] Resignation Request Retracted`;
            const message = `Hi ${employeeName} (${employeeCode}), your resignation request has been cancelled/retracted by the HR department. Your status is now ACTIVE.`;

            // In-app notification
            const employeeUser = await User.findOne({ where: { employeeId: affectedEmployeeId } });
            if (employeeUser) {
                await createNotification({
                    companyId,
                    userId: employeeUser.id,
                    title: subject,
                    message: message,
                    type: "RESIGNATION_CANCELLED",
                    referenceId: id
                });
            }

            // Email notification
            await sendEmail(
                employeeEmail,
                subject,
                message,
                `<p>Hi <b>${employeeName}</b>,</p>
                 <p>This is to inform you that your resignation request (ID: ${employeeCode}) at <b>${company.name}</b> has been <b>RETRACTED / CANCELLED</b> by the HR department.</p>
                 <p>Your employment status is now <b>ACTIVE</b>. Please reach out to your manager or HR for further details.</p>
                 <p>Regards,<br/>HR Department<br/><b>${company.name}</b></p>`,
                [],
                company.name
            );
        } catch (error) {
            console.error("Failed to send resignation cancellation notifications:", error.message);
        }
    }

    return { message: "Resignation cancelled successfully" };
};
