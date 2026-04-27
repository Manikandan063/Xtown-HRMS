import express from "express";
import * as holidayController from "./holiday.controller.js";
import authMiddleware from "../../shared/middlewares/auth.js";
import { checkRole } from "../../shared/middlewares/role.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", holidayController.getHolidays);
router.post("/create", checkRole("SUPER_ADMIN", "ADMIN"), holidayController.createHoliday);
router.post("/populate-defaults", checkRole("SUPER_ADMIN", "ADMIN"), holidayController.populateDefaults);
router.put("/:id", checkRole("SUPER_ADMIN", "ADMIN"), holidayController.updateHoliday);
router.delete("/:id", checkRole("SUPER_ADMIN", "ADMIN"), holidayController.deleteHoliday);

export default router;
