import express from "express";
import * as subController from "./subscription.controller.js";
import authMiddleware from "../../shared/middlewares/auth.js";
import { checkRole } from "../../shared/middlewares/role.js";

const router = express.Router();

router.use(authMiddleware);

// View current plan
router.get("/status", subController.getMySubscriptionStatus);

// Upgrade plan (Only Super Admin should be able to upgrade a company plan)
router.post("/upgrade", checkRole("SUPER_ADMIN", "ADMIN"), subController.upgradePlan);

export default router;
