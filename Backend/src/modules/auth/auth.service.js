import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { db, User, Role, Employee, EmployeePersonalDetail, Company } from "../../models/initModels.js";
import dotenv from "dotenv";
import { sendEmail } from "../../shared/utils/emailSender.js";
import crypto from "crypto";

dotenv.config();

/**
 * Enhanced Login for Admins and Employees
 * Admins/SuperAdmins check against Users table (hashed passwords)
 * Employees check against Employees table (DOB fallback: DD-MM-YYYY)
 */
export const loginUser = async (data) => {
  const identifier = String(data.email || "").trim(); // Renamed for clarity (can be Email or Emp ID)
  const password = String(data.password || "").trim();

  // 1. Try finding in Users table first (Admins/SuperAdmins via Email)
  let user = await User.findOne({
    where: { email: { [Op.iLike]: identifier } },
    include: [
      {
        model: Role,
        as: "role",
        attributes: ["name"],
      },
      {
        model: Company,
        as: "company",
        attributes: ["companyName", "status"],
      }
    ],
  });

  if (user) {
    if (!user.is_active) throw new Error("User account is inactive");
    
    // Check Company Status
    if (user.company?.status === "BLOCKED") {
      throw new Error("Your company account is disabled. Contact administrator.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Incorrect Password (User)");

    return generateAuthResponse(user);
  }

  // 2. If not in Users, check Employees table (Employee ID or Official Email)
  const employees = await Employee.findAll({
    where: {
      [Op.or]: [
        { employeeCode: { [Op.iLike]: identifier } },
        { officialEmail: { [Op.iLike]: identifier } }
      ]
    },
    include: [
      { model: EmployeePersonalDetail, as: "personalDetail" },
      { model: Company, as: "company", attributes: ["companyName", "status"] }
    ]
  });

  if (employees.length > 0) {
    // Multi-tenant handling: If multiple employees have same ID across companies, 
    // find the one that matches the password (DOB)
    let matchingEmployee = null;
    let dobMissingError = false;

    for (const emp of employees) {
      if (emp.status !== "ACTIVE" && emp.status !== "Active") continue;

      const dob = emp.personalDetail?.dateOfBirth;
      let formattedDOB = null;

      if (dob) {
        const [year, month, day] = dob.split("-");
        formattedDOB = `${day}-${month}-${year}`;
      } else {
        dobMissingError = true;
      }

      const isValidDOB = formattedDOB && password === formattedDOB;
      const isTemporaryPassword = password === "Welcome@123";

      if (isValidDOB || isTemporaryPassword) {
        matchingEmployee = emp;
        break;
      }
    }

    if (matchingEmployee) {
      // Check Company Status
      if (matchingEmployee.company?.status === "BLOCKED") {
        throw new Error("Your company account is disabled. Contact administrator.");
      }

      // Return virtual user object
      const empUser = {
        id: matchingEmployee.id,
        employeeId: matchingEmployee.id,
        name: `${matchingEmployee.firstName} ${matchingEmployee.lastName}`,
        email: matchingEmployee.officialEmail,
        role: "user", 
        companyId: matchingEmployee.companyId,
        companyName: matchingEmployee.company?.companyName || "XTOWN",
        companyStatus: matchingEmployee.company?.status,
        canResign: matchingEmployee.canResign,
        designation: "employee"
      };
      return generateAuthResponse(empUser);
    }

    // If no employee matched the password
    if (dobMissingError && password !== "Welcome@123") {
      throw new Error("Date of Birth not configured for this account. Use Welcome@123.");
    }
    throw new Error("Incorrect Password (DOB)");
  }

  throw new Error("Account not found. Verify Employee ID or Email.");
};

/**
 * Helper to generate JWT and consistent User response
 */
const generateAuthResponse = (userData) => {
  const roleNameValue = userData.role?.name || userData.role || 'user';
  
  // Robust Company Name Extraction
  // Checks: 1. Association 'company' | 2. Property 'Company' (Sequelize default) | 3. Flattened prop
  const companyName = 
    userData.company?.companyName || 
    userData.Company?.companyName || 
    userData.companyName || 
    "XTOWN";
  
  const token = jwt.sign(
    {
      userId: userData.id,
      employeeId: userData.employeeId,
      role: roleNameValue,
      companyId: userData.companyId,
      designation: userData.designation,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '365d' }
  );

  return {
    token,
    user: {
      id: userData.id,
      employeeId: userData.employeeId,
      name: userData.name || (userData.firstName ? `${userData.firstName} ${userData.lastName}` : 'User'),
      email: userData.email,
      role: roleNameValue,
      companyId: userData.companyId,
      companyName: String(companyName).toUpperCase(),
      designation: userData.designation,
    },
  };
};

export const forgotPassword = async (identifier) => {
  // 1. Check Admins
  const user = await User.findOne({ 
    where: { email: { [Op.iLike]: identifier } },
    include: [{ model: Company, as: "company" }]
  });

  if (user) {
    const tempPassword = `Reset${crypto.randomInt(1000, 9999)}@!`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    await user.update({ password: hashedPassword });

    await sendEmail(
      user.email,
      "Password Reset - XTown HRMS",
      `Hello ${user.name},\n\nYour password has been reset. Your temporary password is: ${tempPassword}\n\nPlease login and change it immediately.`,
      `<h3>Password Reset</h3><p>Hello <b>${user.name}</b>,</p><p>Your password has been reset. Your temporary password is: <code style="background: #f4f4f4; padding: 5px 10px; border-radius: 4px; font-weight: bold;">${tempPassword}</code></p><p>Please login and change it immediately.</p>`
    );

    return { success: true, message: "A temporary password has been sent to your registered email." };
  }

  // 2. Check Employees
  const employee = await Employee.findOne({
    where: {
      [Op.or]: [
        { employeeCode: { [Op.iLike]: identifier } },
        { officialEmail: { [Op.iLike]: identifier } }
      ]
    },
    include: [{ model: EmployeePersonalDetail, as: "personalDetail" }]
  });

  if (employee) {
    const dob = employee.personalDetail?.dateOfBirth;
    if (!dob) {
      throw new Error("DOB not configured. Please contact HR to set up your account.");
    }

    const [year, month, day] = dob.split("-");
    const formattedDOB = `${day}-${month}-${year}`;

    if (employee.officialEmail) {
      await sendEmail(
        employee.officialEmail,
        "Password Reminder - XTown HRMS",
        `Hello ${employee.firstName},\n\nYour login password is your Date of Birth in DD-MM-YYYY format.\n\nYour password is: ${formattedDOB}`,
        `<h3>Password Reminder</h3><p>Hello <b>${employee.firstName}</b>,</p><p>Your login password is your Date of Birth in <b>DD-MM-YYYY</b> format.</p><p>Based on our records, your password is: <code style="background: #f4f4f4; padding: 5px 10px; border-radius: 4px; font-weight: bold;">${formattedDOB}</code></p>`
      );
    }

    return { success: true, message: "Password hint sent! Please check your official email or use your DOB (DD-MM-YYYY)." };
  }

  throw new Error("No account found with this Email or Employee ID.");
};

export const getMe = async (user) => {
  if (user.role === 'user' || user.role === 'employee') {
    const employee = await Employee.findByPk(user.employeeId, {
      include: [{ model: Company, as: "company", attributes: ["companyName", "status"] }]
    });
    if (!employee) throw new Error("Employee record not found");
    
    return {
      id: employee.id,
      employeeId: employee.id,
      name: `${employee.firstName} ${employee.lastName}`,
      email: employee.officialEmail,
      role: "user", 
      companyId: employee.companyId,
      companyName: employee.company?.companyName || "XTOWN",
      companyStatus: employee.company?.status,
      canResign: employee.canResign,
      designation: "employee"
    };
  } else {
    const userData = await User.findByPk(user.userId, {
      include: [
        { model: Role, as: "role", attributes: ["name"] },
        { model: Company, as: "company", attributes: ["companyName", "status"] }
      ]
    });
    if (!userData) throw new Error("User record not found");

    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role?.name || 'admin',
      companyId: userData.companyId,
      companyName: userData.company?.companyName || "XTOWN",
      companyStatus: userData.company?.status,
      designation: userData.designation,
    };
  }
};