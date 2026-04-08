import express from "express";
import {
  createCompany,
  getAllCompanies,
  getCompany,
  updateCompany,
  deleteCompany,
} from "./company.controller.js";

import authMiddleware from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";

const router = express.Router();

router.use(authMiddleware);

// Isolation is handled in the service layer
router.post("/", allowRoles("super_admin"), createCompany);

router.get("/", allowRoles("super_admin", "admin"), getAllCompanies);
router.get("/:id", allowRoles("super_admin", "admin", "user"), getCompany);
router.put("/:id", allowRoles("super_admin", "admin"), updateCompany);
router.delete("/:id", allowRoles("super_admin"), deleteCompany);

export default router;