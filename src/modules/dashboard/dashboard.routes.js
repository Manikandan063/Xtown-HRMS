import express from "express";
import { getDashboardSummary } from "./dashboard.controller.js";

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
  allowRoles("Super Admin", "Admin"),
  isHRorMD, // Allows HR (Full) or MD (Read-only)
  getDashboardSummary
);

export default router;