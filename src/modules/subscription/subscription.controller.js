import * as subscriptionService from "./subscription.service.js";

/**
 * 🔹 Get Current Subscription Status
 */
export const getMySubscriptionStatus = async (req, res) => {
  try {
    const info = await subscriptionService.getSubscriptionInfo(req.user.companyId);
    res.status(200).json({ success: true, data: info });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

/**
 * 🔹 Upgrade Subscription Plan
 */
export const upgradePlan = async (req, res) => {
  try {
    const { newPlan } = req.body;
    const company = await subscriptionService.upgradePlan(req.user.companyId, newPlan);
    res.status(200).json({ 
      success: true, 
      message: `Successfully upgraded to ${company.subscriptionPlan}`,
      data: company 
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};
