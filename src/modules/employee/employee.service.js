import { db } from "../../models/initModels.js";
import { sequelize } from "../../config/db.js";
import AppError from "../../shared/appError.js";
import { Op } from "sequelize";
import paginate from "../../shared/utils/pagination.js";
import { canAddEmployee } from "../subscription/subscription.service.js";

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
} = db;

/* =====================================================
   CREATE EMPLOYEE
===================================================== */

export const createEmployee = async (data, user) => {
  // 🔹 Subscription Limit Check
  await canAddEmployee(user.companyId || data.companyId);

  const transaction = await sequelize.transaction();

  try {
    const employee = await Employee.create(
      {
        ...data,
        companyId: user.companyId || data.companyId,
        createdBy: user.userId,
      },
      { transaction }
    );

    await transaction.commit();
    return employee;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/* =====================================================
   GET ALL EMPLOYEES (Pagination + Search)
===================================================== */

export const getAllEmployees = async (query, user) => {
  const { page, limit, offset } = paginate(query);

  const where = {
    companyId: user.companyId,
  };

  if (query.search) {
    where[Op.or] = [
      { firstName: { [Op.like]: `%${query.search}%` } },
      { lastName: { [Op.like]: `%${query.search}%` } },
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
  const employee = await Employee.findOne({
    where: {
      id,
      companyId: user.companyId,
    },
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
  const employee = await Employee.findOne({
    where: { id, companyId: user.companyId },
  });

  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  await employee.update({
    ...data,
    updatedBy: user.id,
  });

  return employee;
};

/* =====================================================
   DELETE EMPLOYEE (Soft Delete)
===================================================== */

export const deleteEmployee = async (id, user) => {
  const employee = await Employee.findOne({
    where: { id, companyId: user.companyId },
  });

  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  await employee.destroy();
};

/* =====================================================
   UPDATE PERSONAL DETAILS
===================================================== */

export const updatePersonalDetail = async (employeeId, data, user) => {
  const employee = await Employee.findOne({
    where: {
      id: employeeId,
      companyId: user.companyId,
    },
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