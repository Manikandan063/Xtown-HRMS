import AppError from "../utils/appError.js";

const companyAccess = (modelName = "Resource") => {
  return (req, res, next) => {
    const rawRole = String(req.user?.role || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const isSuperAdmin = rawRole === "superadmin";

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