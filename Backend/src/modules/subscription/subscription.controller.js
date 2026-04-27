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
 * 🔹 CRUD FOR PLANS (SuperAdmin)
 */
export const handleCreatePlan = async (req, res) => {
  try {
    const plan = await subscriptionService.createPlan(req.body);
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const handleGetPlans = async (req, res) => {
  try {
    const plans = await subscriptionService.getPlans();
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const handleUpdatePlan = async (req, res) => {
  try {
    const plan = await subscriptionService.updatePlan(req.params.id, req.body);
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const handleDeletePlan = async (req, res) => {
  try {
    await subscriptionService.deletePlan(req.params.id);
    res.status(200).json({ success: true, message: "Plan deleted successfully" });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

/**
 * 🔹 Create Subscription Request (Admin)
 */
export const createRequest = async (req, res) => {
  try {
    const request = await subscriptionService.createSubscriptionRequest(req.user.companyId, req.body);
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

/**
 * 🔹 Get All Requests (SuperAdmin)
 */
export const getAllRequests = async (req, res) => {
  try {
    const requests = await subscriptionService.getAllSubscriptionRequests();
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

/**
 * 🔹 Get My Company Requests (Admin)
 */
export const getMyRequests = async (req, res) => {
  try {
    const requests = await subscriptionService.getCompanySubscriptionRequests(req.user.companyId);
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

/**
 * 🔹 Approve Request (SuperAdmin)
 */
export const approveRequest = async (req, res) => {
  try {
    const result = await subscriptionService.approveSubscriptionRequest(req.params.id, req.user.userId);
    res.status(200).json({ success: true, message: "Subscription approved and activated.", data: result });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

import { sendEmail } from "../../shared/utils/emailSender.js";
import { db } from "../../models/initModels.js";

/**
 * 🔹 Simulated Automated Payment & Activation
 */
export const handlePayAndActivate = async (req, res) => {
  try {
    const { planName, method } = req.body;
    const companyId = req.user.companyId;
    const { Company, User } = db;

    // 1. Process Logic (Simulated Success)
    const result = await subscriptionService.createSubscriptionRequest(companyId, {
      planName,
      paymentReference: `AUTO-${method.toUpperCase()}-${Date.now()}`,
      notes: `Automated ${method} Payment via Portal.`
    });

    // 2. Auto-Approve (Since payment is 'successful')
    const activation = await subscriptionService.approveSubscriptionRequest(result.id, req.user.userId);

    // 3. Send Confirmation Email to HR (Resilient)
    try {
      const targetEmail = req.user.email;
      const emailHtml = `
        <div style="font-family: sans-serif; padding: 40px; background: #f8fafc; color: #1e293b; max-width: 600px; margin: auto; border-radius: 20px;">
          <h1 style="color: #2563eb; font-size: 24px; font-weight: 800; margin-bottom: 20px;">SUBSCRIPTION RENEWED</h1>
          <p style="font-size: 14px; font-weight: 600;">License activated for: <strong>${planName}</strong></p>
          
          <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <p style="margin: 5px 0; font-size: 12px; color: #64748b;">Transaction ID</p>
            <p style="margin: 0; font-family: monospace; font-weight: 700;">${result.paymentReference}</p>
            
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 15px 0;" />
            
            <p style="margin: 5px 0; font-size: 12px; color: #64748b;">Expiry Date</p>
            <p style="margin: 0; font-weight: 700;">${activation.company.planExpiryDate.toLocaleDateString()}</p>
          </div>
          
          <p style="font-size: 11px; text-align: center; color: #94a3b8; margin-top: 40px;">&copy; 2026 XTOWN HRMS. This is an automated receipt.</p>
        </div>
      `;

      await sendEmail(
        targetEmail,
        `License Renewed: ${planName}`,
        `Your subscription to ${planName} has been successfully renewed. Transaction ID: ${result.paymentReference}`,
        emailHtml
      );
    } catch (emailError) {
      console.error("[SUBSCRIPTION_PAYMENT] License activated but email failed:", emailError.message);
    }

    res.status(200).json({ 
      success: true, 
      message: "Payment successful. License activated.", 
      data: activation 
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};
