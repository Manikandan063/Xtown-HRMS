// import express from "express";
// import { sequelize } from "../../config/db.js";

// const router = express.Router();

// const Employee = sequelize.models.Employee;
// const AttendanceLog = sequelize.models.AttendanceLog;

// router.all("/iclock/cdata", async (req, res) => {
//   const { table } = req.query;

//   console.log("📡 DEVICE HIT");
//   console.log("📦 QUERY:", req.query);
//   console.log("📦 BODY:", req.body);

//   try {

//     // ==============================
//     // 🔹 HANDLE ATTLOG (Normal Mode)
//     // ==============================
//     if (table === "ATTLOG" && req.body) {

//       const lines = req.body.trim().split("\n");

//       for (let line of lines) {
//         const parts = line.trim().split(/\s+/);

//         const employeeCode = parts[0];
//         const punchTime = `${parts[1]} ${parts[2]}`;

//         await saveAttendance(employeeCode, punchTime, req.query.SN);
//       }
//     }

//     // ==============================
//     // 🔹 HANDLE OPERLOG (Your Firmware Mode)
//     // ==============================
//     if (table === "OPERLOG" && req.body) {

//       const lines = req.body.trim().split("\n");

//       for (let line of lines) {

//         if (!line.startsWith("OPLOG")) continue;

//         const parts = line.trim().split(/\s+/);

//         const eventCode = parts[1];

//         // Only punch-related event codes
//         if (!["4", "103", "70"].includes(eventCode)) continue;

//         const punchDate = parts[3];
//         const punchTimePart = parts[4];
//         const employeeCode = parts[5];

//         const fullPunchTime = `${punchDate} ${punchTimePart}`;

//         await saveAttendance(employeeCode, fullPunchTime, req.query.SN);
//       }
//     }

//   } catch (error) {
//     console.error("❌ Attendance processing error:", error);
//   }

//   res.status(200).send("OK\n");
// });


// // ==============================
// // 🔹 COMMON SAVE FUNCTION
// // ==============================
// async function saveAttendance(employeeCode, punchTime, deviceSN) {

//   const employee = await Employee.findOne({
//     where: { employeeCode }
//   });

//   if (!employee) {
//     console.log(`❌ Employee not found: ${employeeCode}`);
//     return;
//   }

//   const existing = await AttendanceLog.findOne({
//     where: {
//       employeeId: employee.id,
//       punchTime: new Date(punchTime)
//     }
//   });

//   if (existing) {
//     console.log("⚠ Duplicate punch skipped");
//     return;
//   }

//   await AttendanceLog.create({
//     companyId: employee.companyId,
//     employeeId: employee.id,
//     deviceId: deviceSN || null,
//     punchTime: new Date(punchTime),
//     punchType: "IN",
//     source: "DEVICE"
//   });

//   console.log(`✅ Attendance saved for ${employeeCode}`);
// }

// export default router;

import express from "express";
import { syncZkAttendance } from "./zk.controller.js";
import * as terminalController from "./terminal.controller.js";
import authMiddleware from "../../shared/middlewares/auth.js";

const router = express.Router();

router.use(authMiddleware);

// Terminal Management
router.get("/", terminalController.getTerminals);
router.post("/", terminalController.createTerminal);
router.put("/:id", terminalController.updateTerminal);
router.delete("/:id", terminalController.deleteTerminal);

// Sync Logic
router.post("/sync-attendance", syncZkAttendance);

export default router;