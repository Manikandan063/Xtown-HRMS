import express from "express";
import * as resignationController from "./resignation.controller.js";
import { checkRole } from "../../shared/middlewares/role.js";
import authMiddleware from "../../shared/middlewares/auth.js";

const router = express.Router();

router.use(authMiddleware);

// Employee routes
router.post("/apply", resignationController.applyResignation);
router.get("/my", resignationController.getMyResignation);
router.delete("/my/:id", resignationController.cancelResignation);

// Admin routes
router.get("/", checkRole("SUPER_ADMIN", "ADMIN"), resignationController.getResignations);
router.get("/stats", checkRole("SUPER_ADMIN", "ADMIN"), resignationController.getDashboardStats);
router.patch("/:id/status", checkRole("SUPER_ADMIN", "ADMIN"), resignationController.updateResignationStatus);
router.patch("/:id", checkRole("SUPER_ADMIN", "ADMIN"), resignationController.updateResignation);
router.put("/checklist/:id", checkRole("SUPER_ADMIN", "ADMIN"), resignationController.updateChecklistItem);
router.post("/:id/complete", checkRole("SUPER_ADMIN", "ADMIN"), resignationController.completeExit);

export default router;