import { db } from "../../models/initModels.js";

export const createDesignation = async (data) => {
  return await db.Designation.create(data);
};

export const getAllDesignations = async (companyId) => {
  return await db.Designation.findAll({
    where: { companyId },
    include: [
      {
        model: db.Department,
        as: "department",
        attributes: ["id", "name"],
      },
    ],
  });
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