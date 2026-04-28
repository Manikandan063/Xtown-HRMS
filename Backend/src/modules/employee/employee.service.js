import { db } from "../../models/initModels.js";
import { sequelize } from "../../config/db.js";
import AppError from "../../shared/utils/appError.js";
import { Op } from "sequelize";
import paginate from "../../shared/utils/pagination.js";
import { canAddEmployee } from "../subscription/subscription.service.js";
import { getCompanyFilter } from "../../shared/utils/roleHelper.js";
import { sendEmail } from "../../shared/utils/emailSender.js";

const {
  Employee,
  Department,
  Designation,
  EmployeePersonalDetail,
  EmployeeContactDetail,
  EmployeeLegalDetail,
  EmployeeSalary,
  EmployeeEducation,
  EmployeeCertification,
  EmployeeExperience,
  EmployeeEmergencyContact,
  EmployeeDocument,
  EmployeeAsset,
  EmployeeBankDetail,
  Project,
  Company,
  Shift,
  User,
  Role
} = db;

import { createNotification } from "../notification/notification.service.js";

/* =====================================================
   CREATE EMPLOYEE
===================================================== */

export const createEmployee = async (data, user) => {
  const companyId = user.companyId || data.companyId;
  
  // 🔹 Subscription Limit Check
  await canAddEmployee(companyId);

  // 🔹 Check for duplicate email or phone
  const duplicateCheck = await Employee.findOne({
    where: {
      companyId,
      [Op.or]: [
        { officialEmail: data.officialEmail },
        ...(data.officialPhone ? [{ officialPhone: data.officialPhone }] : [])
      ]
    },
    paranoid: false
  });

  if (duplicateCheck) {
    if (duplicateCheck.officialEmail === data.officialEmail) {
      throw new AppError("This email ID already exists", 400);
    }
    if (data.officialPhone && duplicateCheck.officialPhone === data.officialPhone) {
      throw new AppError("This phone number already exists", 400);
    }
  }

  const transaction = await sequelize.transaction();

  try {
    // 🔹 AUTO-GENERATE EMPLOYEE CODE
    let employeeCode = data.employeeCode;
    
    // If no code provided, or we want to enforce the EMPxxx pattern
    if (!employeeCode || employeeCode.trim() === "" || employeeCode === "AUTO") {
      const lastEmployee = await Employee.findOne({
        where: { 
          companyId,
          employeeCode: { [Op.like]: 'EMP%' }
        },
        order: [["employeeCode", "DESC"]],
        attributes: ["employeeCode"],
        paranoid: false // Check even deleted employees to avoid unique constraint violations
      });

      if (!lastEmployee) {
        employeeCode = "EMP001";
      } else {
        const lastCode = lastEmployee.employeeCode;
        const match = lastCode.match(/\d+/);
        if (match) {
          let nextNumber = parseInt(match[0], 10) + 1;
          
          // Verify uniqueness just in case of manual gaps or weird overlaps
          let isUnique = false;
          while (!isUnique) {
            employeeCode = `EMP${String(nextNumber).padStart(3, "0")}`;
            const exists = await Employee.findOne({
              where: { companyId, employeeCode },
              paranoid: false
            });
            if (!exists) {
              isUnique = true;
            } else {
              nextNumber++;
            }
          }
        } else {
          employeeCode = "EMP001";
        }
      }
    }

    const employee = await Employee.create(
      {
        ...data,
        employeeCode,
        companyId,
        createdBy: user.userId,
      },
      { transaction }
    );

    await transaction.commit();
    return employee;
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }
};

/* =====================================================
   GET ALL EMPLOYEES (Pagination + Search)
===================================================== */

export const getAllEmployees = async (query, user) => {
  const { page, limit, offset } = paginate(query);

  const rawRole = String(user?.role || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const isSuperAdmin = rawRole === "superadmin";

  const where = {};
  if (!isSuperAdmin) {
    where.companyId = user.companyId;
  }

  if (query.departmentId && query.departmentId !== "ALL") {
    where.departmentId = query.departmentId;
  }

  if (query.search) {
    where[Op.or] = [
      { firstName: { [Op.like]: `%${query.search}%` } },
      { lastName: { [Op.like]: `%${query.search}%` } },
      { employeeCode: { [Op.like]: `%${query.search}%` } },
      { officialEmail: { [Op.like]: `%${query.search}%` } },
    ];
  }

  const { rows, count } = await Employee.findAndCountAll({
    where,
    limit,
    offset,
    include: [
      { model: Department, as: "department" },
      { model: Designation, as: "designation" },
    ],
    order: [["createdAt", "DESC"]],
  });

  return {
    total: count,
    page,
    limit,
    data: rows,
  };
};

/* =====================================================
   GET EMPLOYEE BY ID (Full Profile)
===================================================== */

export const getEmployeeById = async (id, user) => {
  const rawRole = String(user?.role || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const isSuperAdmin = rawRole === "superadmin";

  const where = { id };
  if (!isSuperAdmin) {
    where.companyId = user.companyId;
  }

  const employee = await Employee.findOne({
    where,
    include: [
      { model: Department, as: "department" },
      { model: Designation, as: "designation" },
      { model: EmployeePersonalDetail, as: "personalDetail" },
      { model: EmployeeContactDetail, as: "contactDetail" },
      { model: EmployeeLegalDetail, as: "legalDetail" },
      { model: EmployeeSalary, as: "salary" },
      { model: EmployeeEducation, as: "educations" },
      { model: EmployeeCertification, as: "certifications" },
      { model: EmployeeExperience, as: "experiences" },
      { model: EmployeeEmergencyContact, as: "emergencyContacts" },
      { model: EmployeeDocument, as: "documents" },
      { model: EmployeeAsset, as: "assets" },
      { model: EmployeeBankDetail, as: "bankDetail" },
      { model: Project, as: "projects" },
    ],
  });

  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  return employee;
};

/* =====================================================
   UPDATE EMPLOYEE
===================================================== */

export const updateEmployee = async (id, data, user) => {
  const where = getCompanyFilter(user, { id });
  const employee = await Employee.findOne({ where });

  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  // 🔹 Check for duplicate email or phone (excluding current employee)
  const duplicateCheck = await Employee.findOne({
    where: {
      companyId: employee.companyId,
      id: { [Op.ne]: id },
      [Op.or]: [
        { officialEmail: data.officialEmail || employee.officialEmail },
        ...(data.officialPhone || employee.officialPhone ? [{ officialPhone: data.officialPhone || employee.officialPhone }] : [])
      ]
    },
    paranoid: false
  });

  if (duplicateCheck) {
    if (duplicateCheck.officialEmail === (data.officialEmail || employee.officialEmail)) {
      throw new AppError("This email ID already exists", 400);
    }
    if ((data.officialPhone || employee.officialPhone) && duplicateCheck.officialPhone === (data.officialPhone || employee.officialPhone)) {
      throw new AppError("This phone number already exists", 400);
    }
  }

  const transaction = await sequelize.transaction();

  try {
    // 1. Separate nested data from main employee data
    const { 
      personalDetail, 
      contactDetail, 
      legalDetail, 
      salary, 
      bankDetail,
      ...mainData 
    } = data;

    // 2. Update main employee record
    await employee.update({
      ...mainData,
      updatedBy: (user.role === 'admin' || user.role === 'super_admin' || user.role === 'superadmin') ? user.userId : null,
    }, { transaction });

    // 3. Helper to update or create nested records
    const syncDetail = async (Model, detailData, alias) => {
      if (!detailData || Object.keys(detailData).length === 0) return;
      
      let instance = await Model.findOne({ where: { employeeId: id }, transaction });
      if (instance) {
        await instance.update(detailData, { transaction });
      } else {
        await Model.create({ ...detailData, employeeId: id }, { transaction });
      }
    };

    // 4. Sync all nested records
    await Promise.all([
      syncDetail(EmployeePersonalDetail, personalDetail, 'personalDetail'),
      syncDetail(EmployeeContactDetail, contactDetail, 'contactDetail'),
      syncDetail(EmployeeLegalDetail, legalDetail, 'legalDetail'),
      syncDetail(EmployeeSalary, salary, 'salary'),
      syncDetail(EmployeeBankDetail, bankDetail, 'bankDetail'),
    ]);

    await transaction.commit();
    
    // Return full updated employee
    return await getEmployeeById(id, user);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/* =====================================================
   DELETE EMPLOYEE (Soft Delete)
===================================================== */

export const deleteEmployee = async (id, user) => {
  const where = getCompanyFilter(user, { id });
  const employee = await Employee.findOne({ where });

  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  await employee.destroy();
};

/* =====================================================
   UPDATE PERSONAL DETAILS
===================================================== */

export const updatePersonalDetail = async (employeeId, data, user) => {
  const where = getCompanyFilter(user, { id: employeeId });
  const employee = await Employee.findOne({
    where,
    include: [{ model: Company, as: "company" }]
  });

  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  let personalDetail = await EmployeePersonalDetail.findOne({
    where: { employeeId },
  });

  if (!personalDetail) {
    personalDetail = await EmployeePersonalDetail.create({
      employeeId,
      ...data,
    });
  } else {
    await personalDetail.update(data);
  }

  // 🔹 Debug trigger conditions
  console.log(`[WELCOME_EMAIL_CHECK] Employee: ${employee.firstName}, Data:`, data);

  // 🔹 Trigger Welcome Email if DOB is provided (FORCING FOR DEBUG)
  if (data.dateOfBirth) {
    const [year, month, day] = data.dateOfBirth.split("-");
    const formattedDOB = `${day}-${month}-${year}`;
    const companyName = employee.company?.companyName || "Your Organization";

    try {
      await sendEmail(
        employee.officialEmail,
        `Profile Created Successfully - ${companyName}`,
        `Hello ${employee.firstName},\n\nYour profile was created successfully at ${companyName}. You can now login to the portal.\n\nYour Employee ID: ${employee.employeeCode}\nPassword: ${formattedDOB}\n\nNote: Your password is your Date of Birth in DD-MM-YYYY format.`,
        `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4f46e5;">Profile Created Successfully</h2>
          <p>Hello <b>${employee.firstName}</b>,</p>
          <p>Your profile was created successfully in <b>${companyName}</b>. You can now access your dashboard using the following credentials:</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><b>Your Employee ID :</b> ${employee.employeeCode}</p>
            <p style="margin: 5px 0;"><b>Password :</b> ${formattedDOB}</p>
          </div>
          <p style="font-size: 12px; color: #666;">Note: Your password is your Date of Birth in <b>DD-MM-YYYY</b> format.</p>
          <p style="margin-top: 30px;">Best Regards,<br/>Team ${companyName}</p>
        </div>
        `,
        [],
        companyName
      );
      
      await employee.update({ welcomeEmailSent: true });
    } catch (emailError) {
      console.error("[WELCOME_EMAIL_FAILED]", emailError.message);
      // We don't throw here to avoid blocking the profile update, but we log it.
    }
  }

  return personalDetail;
};

/* =====================================================
   UPDATE BANK DETAIL
===================================================== */

export const updateBankDetail = async (employeeId, data, user) => {
  const employee = await Employee.findOne({
    where: { id: employeeId, companyId: user.companyId },
  });

  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  let bankDetail = await EmployeeBankDetail.findOne({ where: { employeeId } });

  if (!bankDetail) {
    bankDetail = await EmployeeBankDetail.create({ employeeId, ...data });
  } else {
    await bankDetail.update(data);
  }

  return bankDetail;
};

export const updateEmergencyContact = async (
  employeeId,
  data,
  companyId
) => {
  const employee = await Employee.findOne({
    where: { id: employeeId, companyId },
  });

  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  let emergency = await EmployeeEmergencyContact.findOne({
    where: { employeeId },
  });

  if (emergency) {
    await emergency.update(data);
  } else {
    emergency = await EmployeeEmergencyContact.create({
      ...data,
      employeeId,
    });
  }

  return emergency;
};

export const updateEducation = async (employeeId, data, companyId) => {
  const employee = await Employee.findOne({
    where: { id: employeeId, companyId },
  });

  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  let education = await EmployeeEducation.findOne({
    where: { employeeId },
  });

  if (education) {
    await education.update(data);
  } else {
    education = await EmployeeEducation.create({
      ...data,
      employeeId,
    });
  }

  return education;
};
export const updateExperience = async (employeeId, data, companyId) => {
  const employee = await Employee.findOne({
    where: { id: employeeId, companyId },
  });

  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  let experience = await EmployeeExperience.findOne({
    where: { employeeId },
  });

  if (experience) {
    await experience.update(data);
  } else {
    experience = await EmployeeExperience.create({
      ...data,
      employeeId,
    });
  }

  return experience;
};
export const updateSalary = async (employeeId, data, companyId) => {
  const employee = await Employee.findOne({
    where: { id: employeeId, companyId },
  });

  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  let salary = await EmployeeSalary.findOne({
    where: { employeeId },
  });

  if (salary) {
    await salary.update(data);
  } else {
    salary = await EmployeeSalary.create({
      ...data,
      employeeId,
    });
  }

  return salary;
};

export const updateContactDetail = async (employeeId, data, companyId) => {
  const employee = await Employee.findOne({ where: { id: employeeId, companyId } });
  if (!employee) throw new AppError("Employee not found", 404);

  let contact = await EmployeeContactDetail.findOne({ where: { employeeId } });
  if (contact) {
    await contact.update(data);
  } else {
    contact = await EmployeeContactDetail.create({ ...data, employeeId });
  }
  return contact;
};

export const updateLegalDetail = async (employeeId, data, companyId) => {
  const employee = await Employee.findOne({ where: { id: employeeId, companyId } });
  if (!employee) throw new AppError("Employee not found", 404);

  let legal = await EmployeeLegalDetail.findOne({ where: { employeeId } });
  if (legal) {
    await legal.update(data);
  } else {
    legal = await EmployeeLegalDetail.create({ ...data, employeeId });
  }
  return legal;
};

export const updateCertification = async (employeeId, data, companyId) => {
  const employee = await Employee.findOne({ where: { id: employeeId, companyId } });
  if (!employee) throw new AppError("Employee not found", 404);

  // Certifications are usually M:1, so we always create a new record per certification
  // unless we pass an id to update a specific one.
  return await EmployeeCertification.create({ ...data, employeeId });
};

export const updateAsset = async (employeeId, data, companyId) => {
  const employee = await Employee.findOne({ where: { id: employeeId, companyId } });
  if (!employee) throw new AppError("Employee not found", 404);

  return await EmployeeAsset.create({ ...data, employeeId });
};

export const toggleResignationAccess = async (id, user) => {
  const where = getCompanyFilter(user, { id });
  const employee = await Employee.findOne({ where });

  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  await employee.update({
    canResign: !employee.canResign,
    updatedBy: (user.role === 'admin' || user.role === 'super_admin' || user.role === 'superadmin') ? user.userId : null,
  });

  return employee;
};

export const requestResignationAccess = async (id, user) => {
  const employee = await Employee.findByPk(id);
  if (!employee) throw new AppError("Employee record not found", 404);

  // Find all Admins for this company
  const admins = await User.findAll({
    where: { companyId: employee.companyId },
    include: [{ model: Role, as: 'role' }]
  });

  const adminUsers = admins.filter(a => a.role?.name === 'admin' || a.role?.name === 'super_admin');

  for (const admin of adminUsers) {
    await createNotification({
      title: "Resignation Request Alert",
      message: `${employee.firstName} ${employee.lastName} (${employee.employeeCode}) has requested access to the resignation module.`,
      userId: admin.id,
      companyId: employee.companyId,
      type: "RESIGNATION_ACCESS_REQUEST"
    });
  }

  return true;
};