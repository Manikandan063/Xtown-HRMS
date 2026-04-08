import { db } from "../../../models/initModels.js";
import { connectDevice } from "../../../zkDevice/zkConnection.js";
import { getAttendanceLogs } from "../../../zkDevice/zkAttendance.js";
import { Op } from "sequelize";

const { ZKUser, AttendanceLog } = db;

/**
 * 🔹 Sync attendance from ZKTeco device
 * Logic:
 * 1. Connect to device
 * 2. Fetch logs
 * 3. Map deviceUserId -> internal employeeId
 * 4. Prevent duplicates (same employee + same timestamp)
 * 5. Insert into attendance_logs table
 */
export const syncZKTecoAttendance = async (ip, port = 4370, companyId) => {
  let device;
  try {
    // 1. Connection
    device = await connectDevice(ip, port);
    
    // 2. Fetch attendance logs
    const logs = await getAttendanceLogs(device);
    
    if (!logs || logs.length === 0) {
      console.log(`ℹ No logs found on device at ${ip}:${port}`);
      return { success: true, count: 0, message: "No logs found" };
    }

    let syncCount = 0;
    let skippedCount = 0;

    // 3. Process logs
    for (const log of logs) {
      const { deviceUserId, recordTime } = log;
      const punchTime = new Date(recordTime);

      // A. Map mapping device_user_id -> employee
      const mapping = await ZKUser.findOne({
        where: {
          deviceUserId: deviceUserId,
          companyId: companyId
        }
      });

      if (!mapping) {
        // Skip log if no employee mapping found
        console.warn(`[ZK Sync] No mapping for device_user_id: ${deviceUserId}`);
        skippedCount++;
        continue;
      }

      // B. Prevent duplicates (Check if record already exists for the timestamp)
      const existing = await AttendanceLog.findOne({
        where: {
          employeeId: mapping.employeeId,
          companyId: companyId,
          punchTime: punchTime
        }
      });

      if (existing) {
        // Skip if record was already synced
        continue;
      }

      // C. Insert into Attendance table
      await AttendanceLog.create({
        employeeId: mapping.employeeId,
        companyId: companyId,
        punchTime: punchTime,
        punchType: "IN", // Default, adjust logic if device provides IN/OUT
        source: "DEVICE",
        method: "face",
        deviceUserId: deviceUserId
      });

      syncCount++;
    }

    // 4. Disconnect safely
    await device.disconnect().catch(() => {});

    return { 
      success: true, 
      count: syncCount, 
      skipped: skippedCount,
      message: `${syncCount} records synced, ${skippedCount} skipped (no mapping).` 
    };

  } catch (error) {
    console.error("❌ ZK Sync Service Error:", error.message);
    if (device) await device.disconnect().catch(() => {});
    throw error;
  }
};
