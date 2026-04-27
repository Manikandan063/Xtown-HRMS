import { db } from "../../models/initModels.js";
import AppError from "../../shared/utils/appError.js";
import { Op } from "sequelize";
import paginate from "../../shared/utils/pagination.js";

const { EmployeeAsset, Employee, Department, Designation } = db;

export const getAllAssets = async (query, user) => {
  const { page, limit, offset } = paginate(query);
  
  const where = {};
  // If not superadmin, filter by company via Employee join
  const employeeWhere = {};
  if (user.role !== "SUPERADMIN") {
      employeeWhere.companyId = user.companyId;
  }

  if (query.search) {
    where[Op.or] = [
      { assetName: { [Op.like]: `%${query.search}%` } },
      { assetCode: { [Op.like]: `%${query.search}%` } },
      { serialNumber: { [Op.like]: `%${query.search}%` } },
    ];
  }

  const { rows, count } = await EmployeeAsset.findAndCountAll({
    where,
    limit,
    offset,
    include: [
      { 
        model: Employee, 
        as: "employee",
        where: employeeWhere,
        attributes: ['id', 'firstName', 'lastName', 'employeeCode', 'officialEmail'],
        include: [
            { model: Department, as: 'department', attributes: ['name'] },
            { model: Designation, as: 'designation', attributes: ['name'] }
        ]
      }
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

export const getMyAssets = async (employeeId) => {
  return await EmployeeAsset.findAll({
    where: { employeeId },
    order: [["createdAt", "DESC"]],
  });
};

export const createAsset = async (data) => {
  return await EmployeeAsset.create(data);
};

export const updateAsset = async (id, data, companyId) => {
  const asset = await EmployeeAsset.findByPk(id, {
      include: [{ model: Employee, as: 'employee' }]
  });

  if (!asset) {
    throw new AppError("Asset record not found", 404);
  }

  if (companyId && asset.employee.companyId !== companyId) {
      throw new AppError("Unauthorized access to this asset", 403);
  }

  await asset.update(data);
  return asset;
};

export const deleteAsset = async (id, companyId) => {
    const asset = await EmployeeAsset.findByPk(id, {
        include: [{ model: Employee, as: 'employee' }]
    });
  
    if (!asset) {
      throw new AppError("Asset record not found", 404);
    }
  
    if (companyId && asset.employee.companyId !== companyId) {
        throw new AppError("Unauthorized access to this asset", 403);
    }

  await asset.destroy();
};
