/**
 * 🔹 Fetch biometric attendance logs
 * @param {object} device - Connected ZK instance
 * @returns {Promise<Array>} - List of attendance logs
 */
export const getAttendanceLogs = async (device) => {
  try {
    const data = await device.getAttendances();
    
    if (!data || !data.data) {
      return [];
    }

    // Clean and format logs
    const cleanedLogs = data.data.map(log => ({
      deviceUserId: parseInt(log.deviceUserId),
      recordTime: log.recordTime,
      uid: log.uid
    }));

    return cleanedLogs;
  } catch (error) {
    console.error("❌ Error fetching attendance logs:", error.message);
    throw error;
  }
};
