import express from "express";
import { getAnalytics } from "./analytics.controller.js";

import authMiddleware from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";

const router = express.Router();

/* ======================================================
   🔐 Protected Route
   - Must be authenticated
   - Only Admin / Super Admin
====================================================== */

router.get(
  "/dashboard",
  authMiddleware,
  allowRoles("Super Admin", "Admin"),
  getAnalytics
);

export default router;