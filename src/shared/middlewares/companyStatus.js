import { Company } from "../../models/initModels.js";
import AppError from "../utils/appError.js";

/**
 * Middleware to check if the user's company is BLOCKED.
 * If BLOCKED, restrict access to all protected routes.
 */
const checkCompanyStatus = async (req, res, next) => {
  try {
    // 1. Skip check for SuperAdmins
    if (req.user?.role === "super_admin") {
      return next();
    }

    const companyId = req.user?.companyId;
    if (!companyId) return next();

    // 2. Fetch company status (Use cached version if available from authMiddleware)
    let status = req.user?.companyStatus;

    if (!status) {
      const company = await Company.findByPk(companyId, {
        attributes: ["status"]
      });
      if (!company) return next(new AppError("Company not found.", 404));
      status = company.status;
    }

    // 3. If status is BLOCKED, deny access
    if (company.status === "BLOCKED") {
      return res.status(403).json({
        success: false,
        message: "Your company account is disabled. Contact administrator."
      });
    }

    next();
  } catch (error) {
    console.error("[COMPANY-STATUS-MW] Error:", error.message);
    next(error);
  }
};

export default checkCompanyStatus;
