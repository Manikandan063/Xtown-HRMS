import express from "express";
import * as assetController from "./asset.controller.js";
import authMiddleware from "../../shared/middlewares/auth.js";
import { checkRole } from "../../shared/middlewares/role.js";

const router = express.Router();

router.use(authMiddleware);

// Employee routes
router.get("/my", assetController.getMyAssets);

// Admin routes
router.get("/", checkRole("ADMIN", "SUPER_ADMIN", "HR"), assetController.getAllAssets);
router.post("/", checkRole("ADMIN", "SUPER_ADMIN", "HR"), assetController.createAsset);
router.put("/:id", checkRole("ADMIN", "SUPER_ADMIN", "HR"), assetController.updateAsset);
router.delete("/:id", checkRole("ADMIN", "SUPER_ADMIN", "HR"), assetController.deleteAsset);

export default router;
