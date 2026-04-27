import express from "express";
import * as projectController from "./project.controller.js";
import authMiddleware from "../../shared/middlewares/auth.js";
import companyAccess from "../../shared/middlewares/companyAccess.js";
import { uploadProjectFile } from "../../shared/utils/projectUpload.js";

const router = express.Router();

router.use(authMiddleware);
router.use(companyAccess());

/* =====================================================
   PROJECT CORE ROUTES
===================================================== */
router.post("/", projectController.createProject);
router.get("/", projectController.getAllProjects);
router.get("/:id", projectController.getProjectById);
router.put("/:id", projectController.updateProject);
router.delete("/:id", projectController.deleteProject);

/* =====================================================
   PROJECT ASSIGNMENT & UPDATES
===================================================== */
router.post("/assign", projectController.assignEmployeeToProject);
router.put("/status/:id", projectController.updateProjectStatus);
router.put("/progress/:id", projectController.updateProjectProgress);

/* =====================================================
   TEAM & EMPLOYEE PROJECT HISTORY
===================================================== */
router.get("/:id/members", projectController.getProjectMembers);
router.delete("/:id/members/:employeeId", projectController.removeEmployeeFromProject);
router.get("/employees/:id/projects", projectController.getEmployeeProjects);

/* =====================================================
   PROJECT FILE MANAGEMENT
===================================================== */
router.post("/:id/files", uploadProjectFile.single('file'), projectController.uploadProjectFile);
router.get("/:id/files", projectController.getProjectFiles);
router.delete("/files/:fileId", projectController.deleteProjectFile);


export default router;
