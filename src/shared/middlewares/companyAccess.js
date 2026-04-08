import AppError from "../appError.js";

const companyAccess = (modelName = "Resource") => {
  return (req, res, next) => {
    const isSuperAdmin = req.user?.role === "Super Admin";

    if (isSuperAdmin) {
      return next(); // SuperAdmin bypass
    }

    if (!req.user?.companyId) {
      return next(); // allow if no company context
    }

    // Attach companyId to request for filtering in services
    req.companyFilter = { companyId: req.user.companyId };
    next();
  };
};

export default companyAccess;