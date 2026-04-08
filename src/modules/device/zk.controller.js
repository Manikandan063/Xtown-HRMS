// import asyncHandler from "../../shared/asyncHandler.js";
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



import { syncAttendance } from "./zk.service.js";

export const syncZkAttendance = async (req, res) => {
  try {
    const zk = req.zkInstance; // or however you store connection

    const result = await syncAttendance(zk);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Sync failed",
      error: error.message
    });
  }
};