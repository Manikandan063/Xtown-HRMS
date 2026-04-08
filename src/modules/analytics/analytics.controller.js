import asyncHandler from "../../shared/asyncHandler.js";
import { getAnalyticsService } from "./analytics.service.js";

/* ======================================================
   📊 ANALYTICS DASHBOARD DATA
====================================================== */
export const getAnalytics = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;

  const analyticsData = await getAnalyticsService(companyId);

  res.status(200).json({
    success: true,
    message: "Analytics data fetched successfully",
    data: analyticsData,
  });
});