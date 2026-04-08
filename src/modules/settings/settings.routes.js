import express from "express";
import * as settingsController from "./settings.controller.js";
import authMiddleware from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";

const router = express.Router();

// All settings routes require authentication
router.use(authMiddleware);

/* =====================================================
   COMPANY SETTINGS
==================================================== */
router.get("/company", settingsController.getCompanySettings);
router.put(
  "/company",
  allowRoles("ADMIN", "SUPER_ADMIN"),
  settingsController.updateCompanySettings
);

/* =====================================================
   SYSTEM SETTINGS
==================================================== */
router.get("/system", settingsController.getSystemSettings);
router.put(
  "/system",
  allowRoles("ADMIN", "SUPER_ADMIN"),
  settingsController.updateSystemSettings
);

/* =====================================================
   ROLE PERMISSIONS
==================================================== */
router.get("/role/:role", settingsController.getRolePermissions);
router.put(
  "/role/:role",
  allowRoles("SUPER_ADMIN"), // Usually only super admin can change global permissions
  settingsController.updateRolePermissions
);

export default router;
