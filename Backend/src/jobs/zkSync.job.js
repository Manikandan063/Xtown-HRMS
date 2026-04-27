import { syncZKTecoAttendance } from "../modules/attendance/attendance.service.js";
import { db } from "../models/initModels.js";
import dotenv from "dotenv";

dotenv.config();

const { Company } = db;

const SYNC_INTERVAL_MS = process.env.ZK_SYNC_INTERVAL_MS || 60000; // Default 1 minute

export const startZKSyncJob = () => {
  console.log(`⏱ Starting ZKTeco Auto-Sync Job every ${SYNC_INTERVAL_MS / 1000} seconds...`);

  setInterval(async () => {
    try {
      const { Terminal } = db;
      
      // Fetch all active terminals across all companies
      const terminals = await Terminal.findAll({ where: { status: "ACTIVE" } });
      
      if (terminals.length === 0) {
        // Only log if we expect terminals but none found, otherwise stay quiet
        return;
      }

      console.log(`[${new Date().toISOString()}] 🔄 Running Automatic ZK Sync for ${terminals.length} terminals...`);
      
      for (const terminal of terminals) {
        try {
          const ip = terminal.ip?.trim();
          const port = parseInt(terminal.port) || 4370;

          if (!ip) {
            console.warn(`[ZK Sync] Terminal ${terminal.name} has no IP address. Skipping.`);
            continue;
          }

          const result = await syncZKTecoAttendance(ip, port, terminal.companyId);
          if (result.count > 0) {
            console.log(`✅ Auto-Sync [${terminal.name}]: ${result.message}`);
          }
          
          // Update last sync time
          await terminal.update({ lastSync: new Date() });
        } catch (err) {
          console.error(`❌ Auto-Sync [${terminal.name}] Failed:`, err.message);
        }
      }
    } catch (error) {
      console.error("❌ Global ZK Sync Job Error:", error.message);
    }
  }, SYNC_INTERVAL_MS);
};

