import ZKLib from 'node-zklib';

/**
 * 🔹 Connect to ZKTeco biometric device
 * @param {string} ip - Device IP address
 * @param {number} port - Device port (default 4370)
 * @returns {Promise<ZKLib>} - Connected ZK instance
 */
export const connectDevice = async (ip, port = 4370) => {
  const device = new ZKLib(ip, port, 10000, 4000);
  try {
    // Create socket connection
    await device.createSocket();
    console.log(`✅ Connected to ZK Device: ${ip}:${port}`);
    return device;
  } catch (error) {
    console.error(`❌ ZK Connection Failed [${ip}:${port}]:`, error.message);
    throw new Error(`Failed to connect to biometric device at ${ip}:${port}`);
  }
};
