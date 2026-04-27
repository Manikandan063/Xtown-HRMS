import { z } from "zod";

/* ==============================
   CREATE EMPLOYEE
============================== */

export const createEmployeeSchema = z.object({
  employeeCode: z.string().optional().or(z.literal("")),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  officialEmail: z.string().email(),
  officialPhone: z.string().optional(),

  companyId: z.string().uuid().optional(),

  departmentId: z.string().uuid(),
  designationId: z.string().uuid(),
  reportingManagerId: z.string().uuid().optional().nullable(),

  employeeType: z.enum(["PERMANENT", "CONTRACT", "INTERN"]).optional(),
  workLocation: z.string().optional(),
  shiftType: z.string().optional(),

  dateOfJoining: z.string(),
  shiftId: z.string().uuid().optional(),
  isFresher: z.boolean().optional().default(true),
});

/* ==============================
   QUERY (Pagination)
============================== */

export const employeeQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  departmentId: z.string().optional(),
});

/* ==============================
   PERSONAL DETAIL UPDATE
============================== */

export const updatePersonalSchema = z.object({
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  maritalStatus: z
    .enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"])
    .optional(),
  bloodGroup: z.string().optional(),
  nationality: z.string().optional(),
  profileImage: z.string().optional(),
});

/* ==============================
   BANK DETAIL UPDATE
============================== */

export const updateBankDetailSchema = z.object({
  bankName: z.string().min(1),
  accountHolderName: z.string().min(1),
  accountNumber: z.string().min(1),
  ifscCode: z.string().min(1),
  branchName: z.string().optional(),
  accountType: z.enum(["SAVINGS", "CURRENT", "SALARY"]).optional(),
});

/* ==============================
   CONTACT DETAIL UPDATE
============================== */

export const updateContactDetailSchema = z.object({
  personalEmail: z.string().email().optional(),
  alternatePhone: z.string().optional(),
  permanentAddress: z.string().optional(),
  currentAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  pincode: z.string().optional(),
});

/* ==============================
   LEGAL DETAIL UPDATE
============================== */

export const updateLegalDetailSchema = z.object({
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
      message: "Invalid PAN format. Must be 10 characters (e.g. ABCDE1234F) without special symbols."
    })
    .optional()
    .or(z.literal("")),
  aadhaarNumber: z
    .string()
    .regex(/^[2-9]{1}[0-9]{11}$/, {
      message: "Invalid Aadhaar format. Must be 12 digits starting with 2-9 without special symbols."
    })
    .optional()
    .or(z.literal("")),
  pfNumber: z.string().optional(),
  esiNumber: z.string().optional(),
  taxCategory: z.string().optional(),
  tdsApplicable: z.boolean().optional(),
});

/* ==============================
   EDUCATION UPDATE
============================== */

export const updateEducationSchema = z.object({
  degree: z.string().min(1),
  institutionName: z.string().optional(),
  university: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  percentageOrCGPA: z.string().optional(),
});

/* ==============================
   EXPERIENCE UPDATE
============================== */

export const updateExperienceSchema = z.object({
  isFresher: z.boolean().optional(),
  companyName: z.string().optional(),
  designation: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  jobDescription: z.string().optional(),
  location: z.string().optional(),
});

/* ==============================
   SALARY UPDATE
============================== */

export const updateSalarySchema = z.object({
  basicSalary: z.number().min(0),
  hra: z.number().optional(),
  da: z.number().optional(),
  medicalAllowance: z.number().optional(),
  conveyance: z.number().optional(),
  bonus: z.number().optional(),
  incentives: z.number().optional(),
  deductions: z.number().optional(),
  pfAmount: z.number().optional(),
  esiAmount: z.number().optional(),
  netSalary: z.number().min(0),
  effectiveFrom: z.string(),
});

/* ==============================
   EMERGENCY CONTACT UPDATE
============================== */

export const updateEmergencyContactSchema = z.object({
  contactName: z.string().min(1),
  relationship: z.string().min(1),
  phoneNumber: z.string().min(1),
  alternatePhone: z.string().optional(),
  email: z.string().email().optional(),
});

/* ==============================
   CERTIFICATION UPDATE
============================== */

export const updateCertificationSchema = z.object({
  courseName: z.string().min(1),
  issuingOrganization: z.string().optional(),
  certificateNumber: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  documentPath: z.string().optional(),
  verificationStatus: z.enum(["PENDING", "VERIFIED", "REJECTED"]).optional(),
});

/* ==============================
   ASSET UPDATE
============================== */

export const updateAssetSchema = z.object({
  assetName: z.string().min(1),
  assetCategory: z.string().optional(),
  assetCode: z.string().optional(),
  serialNumber: z.string().optional(),
  assignedDate: z.string().optional(),
  returnDate: z.string().optional(),
  conditionAtIssue: z.string().optional(),
  conditionAtReturn: z.string().optional(),
  status: z.enum(["ASSIGNED", "RETURNED", "LOST", "DAMAGED"]).optional(),
  remarks: z.string().optional(),
});

/* ==============================
   DOCUMENT UPDATE
============================== */

export const updateDocumentSchema = z.object({
  documentType: z.string().min(1),
  documentName: z.string().optional(),
  filePath: z.string().min(1),
  verificationStatus: z.enum(["PENDING", "VERIFIED", "REJECTED"]).optional(),
  remarks: z.string().optional(),
});

/* ==============================
   UPDATE EMPLOYEE
============================== */

export const updateEmployeeSchema = createEmployeeSchema.partial().extend({
  personalDetail: updatePersonalSchema.partial().optional(),
  contactDetail: updateContactDetailSchema.partial().optional(),
  legalDetail: updateLegalDetailSchema.partial().optional(),
  salary: updateSalarySchema.partial().optional(),
  bankDetail: updateBankDetailSchema.partial().optional(),
});