import express from "express";
import * as subController from "./subscription.controller.js";
import authMiddleware from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";
import validate from "../../shared/middlewares/validate.js";
import { planSchema, createRequestSchema } from "./subscription.schema.js";

const router = express.Router();

router.use(authMiddleware);

// --- Admin Endpoints ---
router.get("/status", authMiddleware, subController.getMySubscriptionStatus);
router.get("/my-requests", authMiddleware, allowRoles("admin"), subController.getMyRequests);
router.post("/request", authMiddleware, allowRoles("admin"), validate(createRequestSchema), subController.createRequest);
router.post("/pay-and-activate", authMiddleware, allowRoles("admin"), subController.handlePayAndActivate);

// Plan CRUD (SuperAdmin)
router.get("/plans", authMiddleware, subController.handleGetPlans); // Public/Logged in can see available plans
router.post("/plans", authMiddleware, allowRoles("super_admin"), validate(planSchema), subController.handleCreatePlan);
router.put("/plans/:id", authMiddleware, allowRoles("super_admin"), validate(planSchema), subController.handleUpdatePlan);
router.delete("/plans/:id", authMiddleware, allowRoles("super_admin"), subController.handleDeletePlan);

// Approval System (SuperAdmin)
router.get("/requests", authMiddleware, allowRoles("super_admin"), subController.getAllRequests);
router.post("/approve/:id", authMiddleware, allowRoles("super_admin"), subController.approveRequest);

export default router;
