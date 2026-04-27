import { db } from "../../models/initModels.js";
import AppError from "../../shared/utils/appError.js";
import { sequelize } from "../../config/db.js";
import { Op } from "sequelize";
import fs from 'fs';
import path from 'path';

const { Project, EmployeeProject, Employee, ProjectFile, User } = db;

// ... (existing functions)

export const uploadProjectFile = async (projectId, user, file) => {
  return await ProjectFile.create({
    projectId,
    companyId: user.companyId,
    uploadedBy: user.userId,
    fileName: file.filename,
    originalName: file.originalname,
    fileUrl: `/uploads/projects/${file.filename}`,
    fileType: file.mimetype,
    fileSize: file.size,
  });
};

export const getProjectFiles = async (projectId) => {
  return await ProjectFile.findAll({
    where: { projectId },
    include: [
      {
        model: User,
        as: "uploader",
        attributes: ["name", "email"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

export const deleteProjectFile = async (fileId, user) => {
  const file = await ProjectFile.findByPk(fileId);
  if (!file) {
    throw new AppError("File not found", 404);
  }

  // Permission Check: 
  // 1. Admin can delete anything.
  // 2. Employees can ONLY delete their own uploads.
  const isAdmin = user.role.toLowerCase() === 'admin' || user.role.toLowerCase() === 'super_admin';
  const isUploader = file.uploadedBy === user.userId;

  if (!isAdmin && !isUploader) {
    throw new AppError("Permission Denied: You can only delete your own uploads.", 403);
  }

  // Delete physical file
  const filePath = path.join(process.cwd(), 'uploads', 'projects', file.fileName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  return await file.destroy();
};

export const createProject = async (data) => {
  return await Project.create(data);
};

export const getAllProjects = async (user, query = {}) => {
  const companyId = user.companyId;
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const offset = (page - 1) * limit;
  const search = query.search || "";

  const where = { companyId };
  if (search) {
    where[Op.or] = [
      { projectName: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } }
    ];
  }

  // 🔹 Role-based filtering: Employees only see assigned projects
  if (user.role && (user.role.toLowerCase() === 'employee' || user.role.toLowerCase() === 'user') && user.employeeId) {
    const assignedProjectIds = await EmployeeProject.findAll({
       where: { employeeId: user.employeeId },
       attributes: ['projectId']
    });
    const projectIds = assignedProjectIds.map(ap => ap.projectId);
    where.id = { [Op.in]: projectIds };
  }

  const { rows, count } = await Project.findAndCountAll({
    where,
    limit,
    offset,
    include: [
      {
        model: Employee,
        as: "teamLead",
        attributes: ["firstName", "lastName"],
      },
    ],
    order: [["createdAt", "DESC"]]
  });

  return {
    total: count,
    page,
    limit,
    data: rows
  };
};

export const getProjectById = async (id) => {
  const project = await Project.findByPk(id, {
    include: [
      {
        model: Employee,
        as: "teamLead",
        attributes: ["firstName", "lastName"],
      },
      {
        model: EmployeeProject,
        as: "projectMembers",
        include: [
          {
            model: Employee,
            as: "employee",
            attributes: ["firstName", "lastName"],
          },
        ],
      },
    ],
  });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  const members = project.projectMembers.map((pm) => ({
    name: `${pm.employee.firstName} ${pm.employee.lastName}`,
    role: pm.role,
  }));

  return {
    projectName: project.projectName,
    teamLeadName: project.teamLead ? `${project.teamLead.firstName} ${project.teamLead.lastName}` : "N/A",
    projectStatus: project.projectStatus,
    progressPercentage: project.progressPercentage,
    totalMembers: members.length,
    members,
    id: project.id,
    description: project.description,
    startDate: project.startDate,
    endDate: project.endDate,
  };
};

export const updateProject = async (id, data) => {
  const project = await Project.findByPk(id);
  if (!project) {
    throw new AppError("Project not found", 404);
  }
  return await project.update(data);
};

export const deleteProject = async (id) => {
  const project = await Project.findByPk(id);
  if (!project) {
    throw new AppError("Project not found", 404);
  }
  await project.destroy();
  return { message: "Project deleted successfully" };
};

export const assignEmployeeToProject = async (employeeId, projectId, role) => {
  // Check if already assigned to this project
  const existing = await EmployeeProject.findOne({
    where: { employeeId, projectId }
  });

  if (existing) {
    if (existing.isCurrent) {
       throw new AppError("Employee is already an active member of this project", 400);
    }
    // If they were previously removed, reactivate them
    return await existing.update({ isCurrent: true, role, removedDate: null });
  }

  return await EmployeeProject.create({
    employeeId,
    projectId,
    role,
    isCurrent: true,
    assignedDate: new Date(),
  });
};


export const updateProjectStatus = async (projectId, status) => {
  const project = await Project.findByPk(projectId);
  if (!project) {
    throw new AppError("Project not found", 404);
  }
  return await project.update({ projectStatus: status });
};

export const updateProjectProgress = async (projectId, percentage) => {
  const project = await Project.findByPk(projectId);
  if (!project) {
    throw new AppError("Project not found", 404);
  }
  return await project.update({ progressPercentage: percentage });
};

export const removeEmployeeFromProject = async (projectId, employeeId) => {
  const assignment = await EmployeeProject.findOne({
    where: { projectId, employeeId, isCurrent: true }
  });

  if (!assignment) {
    throw new AppError("Member not found in this project team", 404);
  }

  return await assignment.update({
    isCurrent: false,
    removedDate: new Date()
  });
};

export const getProjectMembers = async (projectId) => {

  const members = await EmployeeProject.findAll({
    where: { projectId },
    include: [
      {
        model: Employee,
        as: "employee",
        attributes: ["id", "firstName", "lastName", "officialEmail"],
      },
    ],
  });
  return members.map(m => {
    const employee = m.employee ? m.employee.get({ plain: true }) : {};
    return {
      ...employee,
      EmployeeProject: { role: m.role }
    };
  });
};

export const getEmployeeProjects = async (employeeId) => {
  const allProjects = await EmployeeProject.findAll({
    where: { employeeId },
    include: [
      {
        model: Project,
        as: "project",
        attributes: ["id", "projectName", "projectStatus", "progressPercentage"],
      },
    ],
    order: [["assignedDate", "DESC"]],
  });

  const currentProject = allProjects.find((p) => p.isCurrent);
  const previousProjects = allProjects.filter((p) => !p.isCurrent);

  return {
    currentProject,
    previousProjects,
  };
};
