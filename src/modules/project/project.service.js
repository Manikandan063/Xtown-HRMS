import { db } from "../../models/initModels.js";
import AppError from "../../shared/appError.js";
import { sequelize } from "../../config/db.js";

const { Project, EmployeeProject, Employee } = db;

export const createProject = async (data) => {
  return await Project.create(data);
};

export const getAllProjects = async (companyId) => {
  return await Project.findAll({
    where: { companyId },
    include: [
      {
        model: Employee,
        as: "teamLead",
        attributes: ["firstName", "lastName"],
      },
    ],
  });
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
  const transaction = await sequelize.transaction();

  try {
    await EmployeeProject.update(
      { isCurrent: false, removedDate: new Date() },
      {
        where: { employeeId, isCurrent: true },
        transaction,
      }
    );

    const assignment = await EmployeeProject.create(
      {
        employeeId,
        projectId,
        role,
        isCurrent: true,
        assignedDate: new Date(),
      },
      { transaction }
    );

    await transaction.commit();
    return assignment;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
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
  return members;
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
