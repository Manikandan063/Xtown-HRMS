import { syncZKTecoAttendance } from "../modules/attendance/services/zkSync.service.js";
import { db } from "../models/initModels.js";
import dotenv from "dotenv";

dotenv.config();

const { Company } = db;

const SYNC_INTERVAL_MS = process.env.ZK_SYNC_INTERVAL_MS || 60000; // Default 1 minute
const ZK_DEVICE_IP = process.env.ZK_DEVICE_IP;
const ZK_DEVICE_PORT = process.env.ZK_DEVICE_PORT || 4370;

export const startZKSyncJob = () => {
  if (!ZK_DEVICE_IP) {
    console.warn("⚠ ZK_DEVICE_IP not set. Skipping ZK Auto Sync Job.");
    return;
  }

  console.log(`⏱ Starting ZKTeco Auto-Sync Job every ${SYNC_INTERVAL_MS / 1000} seconds...`);

  setInterval(async () => {
    try {
      // In a real multi-tenant scenario, we would iterate through companies that have devices configured.
      // For now, grabbing the first company, or we can assume IP is tied to a specific company ID.
      // Using a fallback to fetch the first company here as a baseline
      const company = await Company.findOne();
      
      if (!company) {
        console.warn("⚠ No company found for ZK Sync.");
        return;
      }

      console.log(`[${new Date().toISOString()}] 🔄 Running Automatic ZK Sync...`);
      const result = await syncZKTecoAttendance(ZK_DEVICE_IP, ZK_DEVICE_PORT, company.id);
      
      if (result.count > 0) {
        console.log(`✅ Automatic ZK Sync Completed: ${result.message}`);
      }
    } catch (error) {
      console.error("❌ Automatic ZK Sync Failed:", error.message);
    }
  }, SYNC_INTERVAL_MS);
};
