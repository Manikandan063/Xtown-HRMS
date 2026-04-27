import express from "express";
import {
  createCompany,
  getAllCompanies,
  getCompany,
  updateCompany,
  deleteCompany,
  remindClient,
  blockCompany,
  unblockCompany,
} from "./company.controller.js";

import authMiddleware from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";

const router = express.Router();

router.use(authMiddleware);

// Isolation is handled in the service layer
router.post("/", allowRoles("super_admin"), createCompany);

router.get("/", allowRoles("super_admin", "admin", "user"), getAllCompanies);
router.get("/:id", allowRoles("super_admin", "admin", "user"), getCompany);
router.put("/:id", allowRoles("super_admin", "admin"), updateCompany);
router.delete("/:id", allowRoles("super_admin"), deleteCompany);
router.post("/:id/remind-expiry", allowRoles("super_admin"), remindClient);

// SuperAdmin Only: Block/Unblock Company
router.patch("/:id/block", allowRoles("super_admin"), blockCompany);
router.patch("/:id/unblock", allowRoles("super_admin"), unblockCompany);

export default router;