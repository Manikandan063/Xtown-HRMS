import { sequelize } from "./src/config/db.js";
import { initModels } from "./src/models/initModels.js";

const syncDB = async () => {
  try {
    await initModels();
    console.log("🔄 Syncing LocationLog table...");
    // Only sync the new model to avoid messing up existing tables
    const { LocationLog } = await import("./src/models/initModels.js").then(m => m.db);
    await LocationLog.sync({ alter: true });
    console.log("✅ LocationLog table created/updated successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Sync failed:", error.message);
    process.exit(1);
  }
};

syncDB();
