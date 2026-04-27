import bcrypt from "bcryptjs";
import { db } from "../../models/initModels.js";
import AppError from "../../shared/utils/appError.js";

const { User, Role } = db;

export const createUserService = async (data, currentUser) => {
  const { name, email, password, roleId, companyId, designation } = data;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new AppError("Email already exists", 400);
  }

  const role = await Role.findByPk(roleId);
  if (!role) {
    throw new AppError("Invalid role", 400);
  }

  // ✅ Match JWT format
  const isSuperAdmin = currentUser.role === "super_admin";
  const isAdmin = currentUser.role === "admin";

  // 🔒 Role Escalation Protection
  if (isAdmin && role.name.toLowerCase().replace(" ", "_") !== "user") {
    throw new AppError("Admin can only create Users", 403);
  }

  if (!isSuperAdmin && !isAdmin) {
    throw new AppError("Not allowed to create users", 403);
  }

  // 🔒 SuperAdmin must assign company when creating Admin/User
  if (
    isSuperAdmin &&
    role.name.toLowerCase().replace(" ", "_") !== "super_admin" &&
    !companyId
  ) {
    throw new AppError("CompanyId is required", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const finalCompanyId = isSuperAdmin
    ? companyId || null
    : currentUser.companyId;

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role_id: roleId,
    companyId: finalCompanyId,
    designation,
  });

  return user;
};

export const getUsersService = async (currentUser, companyFilter) => {
  const isSuperAdmin = currentUser.role === "super_admin";

  return User.findAll({
    where: isSuperAdmin ? {} : companyFilter,
    include: [
      {
        model: Role,
        as: "role",
      },
      {
        model: db.Company,
        as: "company"
      }
    ],
  });
};

export const updateUserService = async (id, data, currentUser) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isSuperAdmin = currentUser.role === "super_admin";

  if (!isSuperAdmin && user.companyId !== currentUser.companyId) {
    throw new AppError(
      "Forbidden - Cannot modify users from other companies",
      403
    );
  }

  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  if (!isSuperAdmin) {
    delete data.roleId;
    delete data.companyId;
  }

  await user.update(data);
  return user;
};

export const deleteUserService = async (id, currentUser) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isSuperAdmin = currentUser.role === "super_admin";

  if (!isSuperAdmin && user.companyId !== currentUser.companyId) {
    throw new AppError(
      "Forbidden - Cannot delete users from other companies",
      403
    );
  }

  await user.destroy();
};