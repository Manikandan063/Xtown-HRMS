import { loginSchema } from "./auth.schema.js";
import { loginUser } from "./auth.service.js";

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
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};