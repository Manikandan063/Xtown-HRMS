import jwt from "jsonwebtoken";
import { User } from "../../models/user.model.js";
import { Role } from "../../models/role.model.js";
import AppError from "../appError.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("Unauthorized - No token provided", 401));
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user with role
    const user = await User.findByPk(decoded.userId, {
      include: {
        model: Role,
        as: "role",
        attributes: ["name"],
      },
    });

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (!user.role) {
      return next(new AppError("User role not found", 500));
    }

    // Attach minimal clean payload
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role.name,
      companyId: user.companyId,
      designation: user.designation,
    };

    next();
  } catch (error) {
    return next(new AppError("Invalid or expired token", 401));
  }
};

export default authMiddleware;