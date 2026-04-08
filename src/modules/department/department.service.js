import { db } from "../../models/initModels.js";
import AppError from "../../shared/appError.js";

const { Department } = db;

export const createDepartment = async (companyId, data) => {
  const existing = await Department.findOne({
    where: {
      companyId,
      name: data.name,
    },
  });

  if (existing) {
    throw new AppError("Department already exists", 400);
  }

  return await Department.create({
    ...data,
    companyId,
  });
};

export const getAllDepartments = async (companyId) => {
  return await Department.findAll({
    where: { companyId },
    order: [["createdAt", "DESC"]],
  });
};

export const updateDepartment = async (id, companyId, data) => {
  const department = await Department.findOne({
    where: { id, companyId },
  });

  if (!department) {
    throw new AppError("Department not found", 404);
  }

  return await department.update(data);
};

export const deleteDepartment = async (id, companyId) => {
  const department = await Department.findOne({
    where: { id, companyId },
  });

  if (!department) {
    throw new AppError("Department not found", 404);
  }

  await department.destroy();
};