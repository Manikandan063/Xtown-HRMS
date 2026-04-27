import { sequelize } from "../src/config/db.js";
import { Checkpoint } from "../src/models/checkpoint.model.js";
import { AttendanceLog } from "../src/models/attendanceLog.model.js";

async function syncTable() {
  try {
    console.log("Syncing Checkpoint table...");
    await Checkpoint.sync({ alter: true });
    
    console.log("Updating AttendanceLog with checkpointId...");
    // Check if checkpointId column exists in AttendanceLog
    await AttendanceLog.sync({ alter: true });
    
    console.log("✅ Tables synchronized successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Sync failed:", err);
    process.exit(1);
  }
}

syncTable();
