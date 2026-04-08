import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, Role, Employee, EmployeePersonalDetail } from "../../models/initModels.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Enhanced Login for Admins and Employees
 * Admins/SuperAdmins check against Users table (hashed passwords)
 * Employees check against Employees table (DOB fallback: DD-MM-YYYY)
 */
export const loginUser = async (data) => {
  const { email, password } = data;

  // 1. Try finding in Users table first (Admins/SuperAdmins)
  let user = await User.findOne({
    where: { email },
    include: {
      model: Role,
      as: "role",
      attributes: ["name"],
    },
  });

  if (user) {
    if (!user.is_active) throw new Error("User account is inactive");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid email or password");

    return generateAuthResponse(user);
  }

  // 2. If not in Users, check Employees table (Official Email)
  const employee = await Employee.findOne({
    where: { officialEmail: email },
    include: [
      { model: EmployeePersonalDetail, as: "personalDetail" }
    ]
  });

  if (employee) {
    if (employee.status !== "ACTIVE") throw new Error("Employee account is inactive");
    
    // Default password is DOB in format DD-MM-YYYY
    const dob = employee.personalDetail?.dateOfBirth; // returns YYYY-MM-DD
    if (!dob) throw new Error("Contact information (DOB) not found for this account");
    
    // Convert YYYY-MM-DD to DD-MM-YYYY
    const [year, month, day] = dob.split("-");
    const formattedDOB = `${day}-${month}-${year}`;

    if (password !== formattedDOB) {
      throw new Error("Invalid email or password");
    }

    // Return virtual user object for the token/frontend
    const empUser = {
      id: employee.id,
      name: `${employee.firstName} ${employee.lastName}`,
      email: employee.officialEmail,
      role: "user", 
      companyId: employee.companyId,
      designation: "employee"
    };

    return generateAuthResponse(empUser);
  }

  throw new Error("Invalid email or password");
};

/**
 * Helper to generate JWT and consistent User response
 */
const generateAuthResponse = (userData) => {
  const roleNameValue = userData.role?.name || userData.role || 'user';
  
  const token = jwt.sign(
    {
      userId: userData.id,
      role: roleNameValue,
      companyId: userData.companyId,
      designation: userData.designation,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  return {
    token,
    user: {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: roleNameValue,
      companyId: userData.companyId,
      designation: userData.designation,
    },
  };
};