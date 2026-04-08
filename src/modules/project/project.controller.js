import asyncHandler from "../../shared/asyncHandler.js";
import * as projectSchema from "./project.schema.js";
import * as projectService from "./project.service.js";

export const createProject = asyncHandler(async (req, res) => {
  const data = projectSchema.createProjectSchema.parse(req.body);
  const project = await projectService.createProject({
    ...data,
    companyId: req.user.companyId,
  });
  res.status(201).json({
    success: true,
    data: project,
  });
});

export const getAllProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.getAllProjects(req.user.companyId);
  res.status(200).json({
    success: true,
    count: projects.length,
    data: projects,
  });
});

export const getProjectById = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(req.params.id);
  res.status(200).json({
    success: true,
    data: project,
  });
});

export const updateProject = asyncHandler(async (req, res) => {
  const data = projectSchema.updateProjectSchema.parse(req.body);
  const project = await projectService.updateProject(req.params.id, data);
  res.status(200).json({
    success: true,
    message: "Project updated successfully",
    data: project,
  });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const result = await projectService.deleteProject(req.params.id);
  res.status(200).json({
    success: true,
    ...result,
  });
});

export const assignEmployeeToProject = asyncHandler(async (req, res) => {
  const data = projectSchema.assignEmployeeSchema.parse(req.body);
  const assignment = await projectService.assignEmployeeToProject(
    data.employeeId,
    data.projectId,
    data.role
  );
  res.status(201).json({
    success: true,
    message: "Employee assigned to project successfully",
    data: assignment,
  });
});

export const updateProjectStatus = asyncHandler(async (req, res) => {
  const project = await projectService.updateProjectStatus(
    req.params.id,
    req.body.status
  );
  res.status(200).json({
    success: true,
    message: "Project status updated successfully",
    data: project,
  });
});

export const updateProjectProgress = asyncHandler(async (req, res) => {
  const project = await projectService.updateProjectProgress(
    req.params.id,
    req.body.progress
  );
  res.status(200).json({
    success: true,
    message: "Project progress updated successfully",
    data: project,
  });
});

export const getProjectMembers = asyncHandler(async (req, res) => {
  const members = await projectService.getProjectMembers(req.params.id);
  res.status(200).json({
    success: true,
    data: members,
  });
});

export const getEmployeeProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.getEmployeeProjects(req.params.id);
  res.status(200).json({
    success: true,
    data: projects,
  });
});
