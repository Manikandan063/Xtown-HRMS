import express from "express";
import * as checkpointController from "./checkpoint.controller.js";
import authMiddleware from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", checkpointController.getCheckpoints);
router.post("/", allowRoles("Admin", "Super Admin"), checkpointController.createCheckpoint);
router.put("/:id", allowRoles("Admin", "Super Admin"), checkpointController.updateCheckpoint);
router.delete("/:id", allowRoles("Admin", "Super Admin"), checkpointController.deleteCheckpoint);

export default router;
