import jwt from "jsonwebtoken";
import { User, Role, Employee, Company } from "../../models/initModels.js";
import AppError from "../utils/appError.js";

const authMiddleware = async (req, res, next) => {
  console.log(`[AUTH-MW] Checking token for: ${req.method} ${req.url}`);
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("Unauthorized - No token provided", 401));
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user or employee based on role in token
    let authenticatedUser = null;

    // 1. Check Users table first
    const user = await User.findByPk(decoded.userId, {
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["name"],
        },
        {
          model: Company,
          as: "company",
          attributes: ["status"]
        }
      ],
    });

    if (user) {
      // 🟢 SuperAdmin Bypass
      const isSuperAdmin = user.role?.name === "super_admin";
      
      // 🔴 Blocked Company Check
      if (!isSuperAdmin && user.company?.status === "BLOCKED") {
        return next(new AppError("Your company account is disabled. Contact administrator.", 403));
      }

      authenticatedUser = {
        userId: user.id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role?.name || 'admin',
        companyId: user.companyId,
        companyStatus: user.company?.status,
        designation: user.designation,
      };
    } else {
      // 2. Fallback to Employee table
      const employee = await Employee.findByPk(decoded.userId, {
        include: {
          model: Company,
          as: "company",
          attributes: ["status"]
        }
      });

      if (employee) {
        // 🔴 Blocked Company Check
        if (employee.company?.status === "BLOCKED") {
          return next(new AppError("Your company account is disabled. Contact administrator.", 403));
        }

        authenticatedUser = {
          userId: employee.id,
          employeeId: employee.id,
          email: employee.officialEmail,
          role: 'user',
          companyId: employee.companyId,
          companyStatus: employee.company?.status,
          designation: 'employee',
        };
      }
    }

    if (!authenticatedUser) {
      return next(new AppError("Session invalid - user not found in records", 404));
    }

    // Attach minimal clean payload
    req.user = authenticatedUser;

    next();
  } catch (error) {
    return next(new AppError("Invalid or expired token", 401));
  }
};

export default authMiddleware;