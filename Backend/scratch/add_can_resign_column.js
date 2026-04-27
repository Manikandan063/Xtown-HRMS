import { sequelize } from "../src/config/db.js";

const updateEmployeeSchema = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to DB...");

    await sequelize.query(`
      ALTER TABLE employees 
      ADD COLUMN IF NOT EXISTS "canResign" BOOLEAN DEFAULT false;
    `);

    console.log("✅ Column 'canResign' added successfully to 'employees' table.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to update table:", error.message);
    process.exit(1);
  }
};

updateEmployeeSchema();
