import AppError from "./appError.js";

const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    // Sequelize Unique Constraint Error
    if (err.name === "SequelizeUniqueConstraintError") {
        const message = err.errors.map((e) => e.message).join(", ");
        err = new AppError(message, 400);
    }

    // Sequelize Validation Error
    if (err.name === "SequelizeValidationError") {
        const message = err.errors.map((e) => e.message).join(", ");
        err = new AppError(message, 400);
    }

    // Zod Validation Error (if any handled by asyncHandler)
    if (err.name === "ZodError") {
        const issues = err.issues || err.errors || [];
        const message = issues.map((e) => e.message).join(", ") || "Validation error";
        err = new AppError(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        status: err.status,
        message: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};

export default errorMiddleware;
