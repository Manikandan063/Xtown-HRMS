import * as zkSyncService from "../services/zkSync.service.js";

/**
 * 🔹 Controller to trigger ZKTeco attendance sync
 */
export const syncZKAttendance = async (req, res) => {
  try {
    const { ip, port, companyId } = req.body;

    if (!ip || !companyId) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: ip, companyId" 
      });
    }

    const result = await zkSyncService.syncZKTecoAttendance(ip, port, companyId);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Controller Error [syncZKAttendance]:", error.message);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Internal Server Error during ZK sync" 
    });
  }
};
