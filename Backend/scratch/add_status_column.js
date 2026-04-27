import { sequelize } from "../src/config/db.js";

const addStatusColumn = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to DB...");

    // 1. Add the status column to companies table
    // Using raw query to be safe and direct
    await sequelize.query(`
      ALTER TABLE companies 
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE';
    `);

    console.log("✅ Column 'status' added successfully to 'companies' table.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to add column:", error.message);
    process.exit(1);
  }
};

addStatusColumn();
