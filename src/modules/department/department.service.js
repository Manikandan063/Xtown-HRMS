import { db } from "../../models/initModels.js";
import AppError from "../../shared/utils/appError.js";

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

export const getAllDepartments = async (companyId, query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const offset = (page - 1) * limit;

  const { rows, count } = await Department.findAndCountAll({
    where: { companyId },
    limit,
    offset,
    attributes: {
      include: [
        [
          db.sequelize.literal(`(
            SELECT COUNT(*)
            FROM "employees"
            WHERE "employees"."departmentId" = "Department"."id"
            AND "employees"."deletedAt" IS NULL
          )`),
          'employeeCount'
        ]
      ]
    },
    include: [
      {
        model: db.Employee,
        as: "head",
        attributes: ["id", "firstName", "lastName", "employeeCode"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return {
    total: count,
    page,
    limit,
    data: rows
  };
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