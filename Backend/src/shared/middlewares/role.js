import AppError from "../utils/appError.js";

export function allowRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || req.user.role === undefined || req.user.role === null) {
      return next(new AppError("Unauthorized - No role found", 401));
    }

    let userRole;

    const roleValue = req.user.role;

    // 🔹 Case 1: Numeric role (1 = SUPER_ADMIN, 2 = ADMIN, 3 = USER)
    if (typeof roleValue === "number") {
      switch (roleValue) {
        case 1:
          userRole = "SUPER_ADMIN";
          break;
        case 2:
          userRole = "ADMIN";
          break;
        default:
          userRole = "USER";
      }
    }

    // 🔹 Case 2: String role ("Admin", "super admin")
    else if (typeof roleValue === "string") {
      userRole = roleValue
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "_");
    }

    // 🔹 Case 3: Object role { name: "Admin" }
    else if (
      typeof roleValue === "object" &&
      roleValue.name &&
      typeof roleValue.name === "string"
    ) {
      userRole = roleValue.name
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "_");
    }

    // ❌ Invalid role format
    if (!userRole) {
      return next(new AppError("Unauthorized - Invalid role format", 401));
    }

    // Normalize allowed roles (flatten to support both rest params and array passing)
    const normalizedAllowed = allowedRoles.flat().map((role) =>
      String(role)
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "_")
    );

    if (!normalizedAllowed.includes(userRole)) {
      return next(new AppError("Forbidden - Insufficient permissions", 403));
    }

    next();
  };
}

export const checkRole = (...roles) => allowRoles(...roles);