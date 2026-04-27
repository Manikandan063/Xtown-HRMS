import { sequelize } from "../src/config/db.js";
import { documentVaultModel } from "../src/models/documentVault.model.js";
import employeeModel from "../src/models/employee.model.js";
import { User } from "../src/models/user.model.js";

const DocumentVault = documentVaultModel(sequelize);
const Employee = employeeModel(sequelize);

async function sync() {
  try {
    console.log("Checking DB connection...");
    await sequelize.authenticate();
    console.log("Syncing DocumentVault model...");
    
    // We need to sync Employee first if there's a FK, but DocumentVault model doesn't have explicit FK in definition
    // However, associations might be needed.
    
    await DocumentVault.sync({ alter: true });
    console.log("✅ DocumentVault synced successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Sync failed:", error);
    process.exit(1);
  }
}

sync();
