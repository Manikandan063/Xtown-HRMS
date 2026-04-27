import express from "express";
import * as shiftController from "./shift.controller.js";
import { checkRole } from "../../shared/middlewares/role.js";
import authMiddleware from "../../shared/middlewares/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/create", checkRole("SUPER_ADMIN", "ADMIN"), shiftController.createShift);
router.post("/assign/:employeeId", checkRole("SUPER_ADMIN", "ADMIN"), shiftController.assignShift);
router.post("/bulk-assign", checkRole("SUPER_ADMIN", "ADMIN"), shiftController.bulkAssignShift);
router.get("/", checkRole("SUPER_ADMIN", "ADMIN", "USER"), shiftController.getShifts);
router.put("/:id", checkRole("SUPER_ADMIN", "ADMIN"), shiftController.updateShift);
router.delete("/:id", checkRole("SUPER_ADMIN", "ADMIN"), shiftController.deleteShift);

export default router;
