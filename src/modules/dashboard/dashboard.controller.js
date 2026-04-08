import asyncHandler from "../../shared/asyncHandler.js";
import { getDashboardSummaryService } from "./dashboard.service.js";

/* ======================================================
   📊 DASHBOARD SUMMARY
====================================================== */
export const getDashboardSummary = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;

  const summary = await getDashboardSummaryService(companyId, req.user);

  res.status(200).json({
    success: true,
    message: "Dashboard summary fetched successfully",
    data: summary,
  });
});