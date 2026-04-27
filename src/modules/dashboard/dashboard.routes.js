import express from "express";
import { getDashboardSummary, exportAllData } from "./dashboard.controller.js";

import authMiddleware from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";
import { isHRorMD } from "../../shared/middlewares/designation.js";

const router = express.Router();

/* ======================================================
   🔐 Protected Route
   - Must be authenticated
   - Admin / Super Admin
   - HR / MD access level
 ====================================================== */
router.get(
  "/summary",
  authMiddleware,
  getDashboardSummary
);

router.get(
  "/export-all",
  authMiddleware,
  allowRoles("Admin", "Super Admin"),
  exportAllData
);



export default router;