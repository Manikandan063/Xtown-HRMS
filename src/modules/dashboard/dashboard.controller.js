import asyncHandler from "../../shared/utils/asyncHandler.js";
import { getDashboardSummaryService, exportAllDataService } from "./dashboard.service.js";

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

/* ======================================================
   📦 FULL SYSTEM EXPORT (ADMIN ONLY)
====================================================== */
export const exportAllData = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;
  const backup = await exportAllDataService(companyId, req.user);

  res.status(200).json({
    success: true,
    message: "System backup generated successfully",
    data: backup,
  });
});