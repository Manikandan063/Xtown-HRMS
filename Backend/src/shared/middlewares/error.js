import AppError from "../utils/appError.js";

const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    // Sequelize Errors
    if (err.name === "SequelizeUniqueConstraintError" || err.name === "SequelizeValidationError") {
        const message = err.errors.map((e) => e.message).join(", ");
        err = new AppError(message, 400);
    }

    // Zod Errors
    if (err.name === "ZodError") {
        const issues = err.issues || err.errors || [];
        const message = issues.map((e) => e.message).join(", ") || "Validation error";
        err = new AppError(message, 400);
    }

    // JWT Errors
    if (err.name === "JsonWebTokenError") {
        err = new AppError("Invalid token. Please log in again.", 401);
    }
    if (err.name === "TokenExpiredError") {
        err = new AppError("Your token has expired. Please log in again.", 401);
    }

    // Log unexpected errors in production
    if (err.statusCode === 500) {
        console.error("ERROR 💥", err);
    }

    res.status(err.statusCode).json({
        success: false,
        status: err.status,
        message: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};

export default errorMiddleware;
