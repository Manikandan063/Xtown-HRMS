import { DocumentVault, Employee, User } from "../../models/initModels.js";
import AppError from "../../shared/utils/appError.js";
import { Op } from "sequelize";
import fs from "fs";
import path from "path";

export const uploadDocument = async (req, res, next) => {
  try {
    const { employeeId, documentType, remarks, documentName } = req.body;

    if (!req.file) {
      return next(new AppError("Please upload a file", 400));
    }

    const document = await DocumentVault.create({
      employeeId,
      documentType,
      documentName: documentName || req.file.originalname,
      filePath: `/uploads/documents/${req.file.filename}`,
      fileType: req.file.mimetype,
      uploadedBy: req.user.userId,
      remarks,
      verificationStatus: "Pending"
    });

    res.status(201).json({
      status: "success",
      data: document
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeDocuments = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    
    // Security check: Employee can only see their own docs
    if (req.user.role === 'user' && req.user.employeeId !== employeeId) {
       return next(new AppError("Unauthorized access", 403));
    }

    const documents = await DocumentVault.findAll({
      where: { employeeId },
      include: [
        { model: User, as: "uploader", attributes: ["name"] }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.json({
      status: "success",
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

export const getAllDocuments = async (req, res, next) => {
  try {
    if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
      return next(new AppError("Access denied", 403));
    }

    const { search, type, status } = req.query;
    const where = {};

    if (type) where.documentType = type;
    if (status) where.verificationStatus = status;

    const whereEmployee = {};
    if (req.user.role === 'admin') {
      whereEmployee.companyId = req.user.companyId;
    }
    if (search) {
      whereEmployee[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { employeeCode: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const documents = await DocumentVault.findAll({
      where,
      include: [
        { 
          model: Employee, 
          as: "employee", 
          attributes: ["firstName", "lastName", "employeeCode"],
          where: Object.keys(whereEmployee).length > 0 ? whereEmployee : undefined,
          required: Object.keys(whereEmployee).length > 0
        },
        { model: User, as: "uploader", attributes: ["name"] }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.json({
      status: "success",
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

export const verifyDocument = async (req, res, next) => {
  try {
    if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
      return next(new AppError("Access denied", 403));
    }

    const { id } = req.params;
    const { status, remarks } = req.body;

    const document = await DocumentVault.findByPk(id);
    if (!document) {
      return next(new AppError("Document not found", 404));
    }

    document.verificationStatus = status;
    document.remarks = remarks;
    await document.save();

    res.json({
      status: "success",
      data: document
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await DocumentVault.findByPk(id);

    if (!document) {
      return next(new AppError("Document not found", 404));
    }

    // Security check
    if (req.user.role === 'user' && req.user.employeeId !== document.employeeId) {
      return next(new AppError("Unauthorized", 403));
    }

    // Delete file from disk
    const fullPath = path.join(process.cwd(), document.filePath.startsWith('/') ? document.filePath.slice(1) : document.filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    await document.destroy();

    res.json({
      status: "success",
      message: "Document deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};
