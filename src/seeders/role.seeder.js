import { Role } from "../models/role.model.js";

export const seedRoles = async () => {
  try {
    const roles = [
      { name: "super_admin", description: "System Super Administrator" },
      { name: "admin", description: "Company Administrator" },
      { name: "user", description: "Employee User" },
    ];

    for (const role of roles) {
      await Role.findOrCreate({
        where: { name: role.name },
        defaults: role,
      });
    }

    console.log("✅ Roles seeded successfully");
  } catch (error) {
    console.error("❌ Role seeding failed:", error.message);
  }
};