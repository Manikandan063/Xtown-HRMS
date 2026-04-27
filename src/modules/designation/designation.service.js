import { db } from "../../models/initModels.js";

export const createDesignation = async (data) => {
  return await db.Designation.create(data);
};

export const getAllDesignations = async (companyId, query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const offset = (page - 1) * limit;

  const { rows, count } = await db.Designation.findAndCountAll({
    where: { companyId },
    limit,
    offset,
    attributes: {
      include: [
        [
          db.sequelize.literal(`(
            SELECT COUNT(*)
            FROM "employees"
            WHERE "employees"."designationId" = "Designation"."id"
            AND "employees"."deletedAt" IS NULL
          )`),
          'employeeCount'
        ]
      ]
    },
    include: [
      {
        model: db.Department,
        as: "department",
        attributes: ["id", "name"],
      },
    ],
  });

  return {
    total: count,
    page,
    limit,
    data: rows
  };
};

export const getDesignationById = async (id, companyId) => {
  return await db.Designation.findOne({
    where: { id, companyId },
    include: [
      {
        model: db.Department,
        as: "department",
        attributes: ["id", "name"],
      },
    ],
  });
};

export const updateDesignation = async (id, companyId, data) => {
  return await db.Designation.update(data, {
    where: { id, companyId },
  });
};

export const deleteDesignation = async (id, companyId) => {
  return await db.Designation.destroy({
    where: { id, companyId },
  });
};