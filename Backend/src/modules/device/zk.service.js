// import { sequelize } from "../../config/db.js";
// import { AttendanceLog } from "../../models/attendanceLog.model.js";
// import Employee from "../../models/employee.model.js";
// import ZKLib from "node-zklib";

// /**
//  * 🔹 Connect to ZKTeco Device
//  */
// export const connectDevice = async (ip, port = 4370) => {
//   const zkInstance = new ZKLib(ip, port, 10000, 4000);
//   try {
//     await zkInstance.createSocket();
//     return zkInstance;
//   } catch (error) {
//     console.error(`❌ Connection failed to ${ip}:${port}`, error);
//     throw new Error("Device connection failed");
//   }
// };

// /**
//  * 🔹 Fetch Attendance Logs from Device
//  */
// export const fetchAttendanceLogsFromDevice = async (zkInstance) => {
//   try {
//     const logs = await zkInstance.getAttendance();
//     return logs.data;
//   } catch (error) {
//     console.error("❌ Error fetching attendance logs", error);
//     throw new Error("Failed to fetch logs from device");
//   }
// };

// export const processAttendance = async (data) => {
//   if (!data?.UserID || !data?.RecordTime) return;

//   const transaction = await sequelize.transaction();

//   try {
//     // 1️⃣ Find employee using deviceUserId
//     const employee = await Employee.findOne({
//       where: { deviceUserId: data.UserID },
//       transaction,
//     });

//     if (!employee) {
//       await transaction.commit();
//       return;
//     }

//     // 2️⃣ Save raw attendance log
//     await AttendanceLog.create(
//       {
//         employeeId: employee.id,
//         companyId: employee.companyId,
//         deviceUserId: data.UserID,
//         punchTime: new Date(data.RecordTime),
//         verifyCode: data.VerifyCode || null,
//         deviceSerialNumber: data.SN || null,
//         method: "face",
//         source: "DEVICE",
//         punchType: "IN", // Defaulting to IN, but can be improved
//       },
//       { transaction }
//     );

//     await transaction.commit();
//   } catch (error) {
//     await transaction.rollback();
//     throw error;
//   }
// };



// Add this inside zk.service.js

import { sequelize } from "../../config/db.js";

export const syncAttendance = async (zk) => {
  try {
    const logs = await zk.getAttendances();

    const data = logs.data || [];

    for (let log of data) {
      const deviceUserId = log.uid;
      const timestamp = log.timestamp;

      // 🔍 Map device user → employee
      const [userRes] = await sequelize.query(
        "SELECT employee_id, company_id FROM zk_users WHERE device_user_id = $1",
        { bind: [deviceUserId] }
      );

      if (userRes.length === 0) continue;

      const { employee_id, company_id } = userRes[0];

      // 🚫 Prevent duplicate
      const [checkRes] = await sequelize.query(
        `SELECT id FROM attendance 
         WHERE employee_id = $1 AND check_in_time = $2`,
        { bind: [employee_id, timestamp] }
      );

      if (checkRes.length > 0) continue;

      // ✅ Insert attendance
      await sequelize.query(
        `INSERT INTO attendance 
        (employee_id, company_id, check_in_time, method, device_user_id)
        VALUES ($1, $2, $3, 'face', $4)`,
        { bind: [employee_id, company_id, timestamp, deviceUserId] }
      );
    }

    return { success: true, message: "Attendance synced" };

  } catch (error) {
    console.error("❌ ZK Sync Error", error);
    throw error;
  }
};