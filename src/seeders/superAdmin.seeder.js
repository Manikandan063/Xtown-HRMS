import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import { Role } from "../models/role.model.js";

export const seedSuperAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({
      where: { email: "superadmin@hrms.com" },
    });

    if (existingAdmin) {
      console.log("⚠ Super Admin already exists");
      return;
    }

    const role = await Role.findOne({
      where: { name: "super_admin" },
    });

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await User.create({
      name: "Super Admin",
      email: "superadmin@hrms.com",
      password: hashedPassword,
      role_id: role.id,
      companyId: null,
    });

    console.log("✅ Super Admin created successfully");
  } catch (error) {
    console.error("❌ Super Admin seeding failed:", error.message);
  }
};