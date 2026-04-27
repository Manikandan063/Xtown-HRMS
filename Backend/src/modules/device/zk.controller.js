// import asyncHandler from "../../shared/utils/asyncHandler.js";
// import * as zkService from "./zk.service.js";

// export const receiveADMS = asyncHandler(async (req, res) => {
//   console.log("📡 DEVICE HIT");
//   console.log("📦 QUERY:", req.query);
//   console.log("📦 BODY:", req.body);

//   // existing logic below...
//   // ZKTeco sends form-urlencoded data
//   const payload = req.body;

//   await zkService.processAttendance(payload);

//   // ⚠ Device requires plain text response
//   res.status(200).send("OK");
// });



import { syncZKTecoAttendance } from "../attendance/attendance.service.js";
import { db } from "../../models/initModels.js";
const { Terminal } = db;

export const syncZkAttendance = async (req, res) => {
  try {
    const { terminalId } = req.body;
    const companyId = req.user.companyId;

    let terminals = [];
    if (terminalId) {
      const terminal = await Terminal.findOne({ where: { id: terminalId, companyId } });
      if (!terminal) {
        return res.status(404).json({ success: false, message: "Terminal not found" });
      }
      terminals.push(terminal);
    } else {
      terminals = await Terminal.findAll({ where: { companyId, status: "ACTIVE" } });
    }

    if (terminals.length === 0) {
      return res.status(400).json({ success: false, message: "No active terminals found to sync" });
    }

    const results = [];
    for (const terminal of terminals) {
      try {
        const ip = terminal.ip?.trim();
        const port = parseInt(terminal.port) || 4370;
        const result = await syncZKTecoAttendance(ip, port, companyId);
        results.push({ terminal: terminal.name, ...result });
      } catch (err) {
        results.push({ terminal: terminal.name, success: false, error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: "Sync process completed",
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Sync failed",
      error: error.message
    });
  }
};