import express from "express";
import * as resignationController from "./resignation.controller.js";
import { checkRole } from "../../shared/middlewares/role.js";
import authMiddleware from "../../shared/middlewares/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/apply", resignationController.applyResignation);
router.get("/", checkRole("SUPER_ADMIN", "ADMIN"), resignationController.getResignations);
router.patch("/approve/:id", checkRole("SUPER_ADMIN", "ADMIN"), resignationController.approveResignation);
router.post("/calculate-settlement/:id", checkRole("SUPER_ADMIN", "ADMIN"), resignationController.calculateSettlement);

export default router;