import AppError from "../appError.js";

/**
 * Middleware to restrict access based on user designation (HR or MD).
 * Logic:
 * - HR has full access (POST, PUT, GET, DELETE).
 * - MD has read-only access (Only GET).
 */
export const designationAccess = (req, res, next) => {
  const { role, designation } = req.user;

  // 1. Super Admin always has full access
  if (role === "SUPER_ADMIN" || role === "Super Admin") {
    return next();
  }

  // 2. If MD and trying to modify data, block it
  if (designation === "MD" && req.method !== "GET") {
    return next(new AppError("Forbidden - MD has read-only access", 403));
  }

  // 3. Allow HR to do everything
  if (designation === "HR") {
    return next();
  }

  // 4. Default: allow next if it matches designation expectations or let other layers handle it
  // But usually if it's explicitly set as Designation required, we check it.
  
  next();
};

export const isHR = (req, res, next) => {
  const { designation, role } = req.user;
  if (designation !== "HR" && role !== "SUPER_ADMIN" && role !== "Super Admin") {
    return next(new AppError("Forbidden - Only HR has full access", 403));
  }
  next();
};

export const isMD = (req, res, next) => {
  const { designation, role } = req.user;
  if (designation !== "MD" && role !== "SUPER_ADMIN" && role !== "Super Admin") {
    return next(new AppError("Forbidden - Access denied", 403));
  }
  
  if (req.method !== "GET") {
    return next(new AppError("Forbidden - MD has read-only access", 403));
  }
  next();
};

export const isHRorMD = (req, res, next) => {
  const { designation, role } = req.user;
  if (
    designation !== "HR" &&
    designation !== "MD" &&
    role !== "SUPER_ADMIN" &&
    role !== "Super Admin"
  ) {
    return next(new AppError("Forbidden - Access restricted to HR and MD", 403));
  }
  
  // MD is still read-only even in combined check
  if (designation === "MD" && req.method !== "GET") {
    return next(new AppError("Forbidden - MD has read-only access", 403));
  }

  next();
};
