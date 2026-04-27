import express from "express";
import * as controller from "./designation.controller.js";
import authMiddleware from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", allowRoles("SuperAdmin", "Admin"), controller.createDesignation);
router.get("/", controller.getAllDesignations);
router.put("/:id", allowRoles("SuperAdmin", "Admin"), controller.updateDesignation);
router.delete("/:id", allowRoles("SuperAdmin", "Admin"), controller.deleteDesignation);

export default router;