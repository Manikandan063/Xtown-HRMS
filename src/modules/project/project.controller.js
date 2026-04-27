import asyncHandler from "../../shared/utils/asyncHandler.js";
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
  const result = await projectService.getAllProjects(req.user, req.query);
  res.status(200).json({
    success: true,
    ...result,
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
    req.body.projectStatus || req.body.status
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
    req.body.progressPercentage || req.body.progress
  );
  res.status(200).json({
    success: true,
    message: "Project progress updated successfully",
    data: project,
  });
});


export const removeEmployeeFromProject = asyncHandler(async (req, res) => {
  await projectService.removeEmployeeFromProject(
    req.params.id,
    req.params.employeeId
  );
  res.status(200).json({
    success: true,
    message: "Member removed from project successfully",
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

export const uploadProjectFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const projectFile = await projectService.uploadProjectFile(
    req.params.id,
    req.user,
    req.file
  );

  res.status(201).json({
    success: true,
    message: "File uploaded successfully",
    data: projectFile,
  });
});

export const getProjectFiles = asyncHandler(async (req, res) => {
  console.log(`[DEBUG] Fetching files for project: ${req.params.id}`);
  try {
    const files = await projectService.getProjectFiles(req.params.id);
    res.status(200).json({
      success: true,
      data: files,
    });
  } catch (error) {
    console.error(`[ERROR] Failed to fetch project files:`, error);
    throw error;
  }
});

export const deleteProjectFile = asyncHandler(async (req, res) => {
  await projectService.deleteProjectFile(req.params.fileId, req.user);
  res.status(200).json({
    success: true,
    message: "File deleted successfully",
  });
});
