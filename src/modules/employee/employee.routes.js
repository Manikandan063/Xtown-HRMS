import express from "express";
import * as employeeController from "./employee.controller.js";
import authMiddleware from "../../shared/middlewares/auth.js";
import companyAccess from "../../shared/middlewares/companyAccess.js";

const router = express.Router();

/* =====================================================
   APPLY AUTH + COMPANY ACCESS
===================================================== */

router.use(authMiddleware);
router.use(companyAccess());

/* =====================================================
   CORE EMPLOYEE ROUTES
===================================================== */

router.post("/", employeeController.createEmployee);

router.get("/", employeeController.getAllEmployees);

router.get("/:id", employeeController.getEmployeeById);

router.put("/:id", employeeController.updateEmployee);

router.delete("/:id", employeeController.deleteEmployee);

// Section APIs
router.put("/:id/personal", employeeController.updatePersonalDetail);
router.put("/:id/bank", employeeController.updateBankDetail);
router.put("/:id/emergency", employeeController.updateEmergencyContact);
router.put("/:id/education", employeeController.updateEducation);
router.put("/:id/experience", employeeController.updateExperience);
router.put("/:id/salary", employeeController.updateSalary);
router.put("/:id/contact", employeeController.updateContactDetail);
router.put("/:id/legal", employeeController.updateLegalDetail);
router.put("/:id/certification", employeeController.updateCertification);
router.put("/:id/asset", employeeController.updateAsset);

export default router;