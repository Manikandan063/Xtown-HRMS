import { Router } from "express";
import * as controller from "./department.controller.js";
import authMiddleware from "../../shared/middlewares/auth.js";

const router = Router();

router.use(authMiddleware);

router.post("/", controller.createDepartment);
router.get("/", controller.getDepartments);
router.put("/:id", controller.updateDepartment);
router.delete("/:id", controller.deleteDepartment);

export default router;