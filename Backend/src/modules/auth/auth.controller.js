import { loginSchema } from "./auth.schema.js";
import { loginUser, forgotPassword as forgotPasswordService, getMe as getMeService } from "./auth.service.js";

export const login = async (req, res) => {
  try {
    // Validation is already handled by validate(loginSchema) middleware in routes
    const result = await loginUser(req.body);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    console.error("Login Controller Error:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;
    console.log(`[AUTH] Forgot password request for: ${identifier}`);
    if (!identifier) throw new Error("Email or Employee ID is required");
    
    const result = await forgotPasswordService(identifier);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const result = await getMeService(req.user);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};