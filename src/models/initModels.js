import { sequelize } from "../config/db.js";

import { Role } from "./role.model.js";
import { User } from "./user.model.js";
import { Company } from "./company.model.js";

import departmentModel from "./department.model.js";
import designationModel from "./designation.model.js";
import employeeModel from "./employee.model.js";
import employeePersonalDetailModel from "./employeePersonalDetail.js";
import employeeContactDetailModel from "./employeeContactDetail.model.js";
import employeeLegalDetailModel from "./employeeLegalDetail.model.js";
import employeeSalaryModel from "./employeeSalary.model.js";
import employeeEducationModel from "./employeeEducation.model.js";
import employeeCertificationModel from "./employeeCertification.model.js";
import employeeExperienceModel from "./employeeExperience.model.js";
import employeeEmergencyContactModel from "./employeeEmergencyContact.model.js";
import employeeDocumentModel from "./employeeDocument.model.js";
import employeeAssetModel from "./employeeAsset.model.js";
import employeeBankDetailModel from "./employeeBankDetail.js";
import { AttendanceLog } from "./attendanceLog.model.js";
import { AttendanceDaily } from "./attendanceDaily.model.js";
import { LeaveType } from "./leaveType.model.js";
import { LeaveRequest } from "./leaveRequest.model.js";
import shiftModel from "./shift.model.js";
import { Payroll } from "./payroll.model.js";
import { notificationModel } from "./notification.model.js";
import leaveBalanceModel from "./leaveBalance.model.js";
import { ZKUser } from "./zkUser.model.js";
import projectModel from "./project.model.js";
import employeeProjectModel from "./employeeProject.model.js";
import companySettingsModel from "./companySettings.model.js";
import systemSettingsModel from "./systemSettings.model.js";
import rolePermissionModel from "./rolePermission.model.js";
import resignationModel from "./resignation.model.js";
import salaryAdjustmentModel from "./salaryAdjustment.model.js";
import holidayModel from "./holiday.model.js";
import documentModel from "./document.model.js";

/* ==============================
   INITIALIZE FUNCTION MODELS
============================== */
export const Department = departmentModel(sequelize);
export const Designation = designationModel(sequelize);
export const Shift = shiftModel(sequelize);
export const Employee = employeeModel(sequelize);
export const EmployeePersonalDetail = employeePersonalDetailModel(sequelize);
export const EmployeeContactDetail = employeeContactDetailModel(sequelize);
export const EmployeeLegalDetail = employeeLegalDetailModel(sequelize);
export const EmployeeSalary = employeeSalaryModel(sequelize);
export const EmployeeEducation = employeeEducationModel(sequelize);
export const EmployeeCertification = employeeCertificationModel(sequelize);
export const EmployeeExperience = employeeExperienceModel(sequelize);
export const EmployeeEmergencyContact = employeeEmergencyContactModel(sequelize);
export const EmployeeDocument = employeeDocumentModel(sequelize);
export const EmployeeAsset = employeeAssetModel(sequelize);
export const EmployeeBankDetail = employeeBankDetailModel(sequelize);
export const Notification = notificationModel(sequelize);
export const LeaveBalance = leaveBalanceModel(sequelize);
export const Project = projectModel(sequelize);
export const EmployeeProject = employeeProjectModel(sequelize);
export const CompanySettings = companySettingsModel(sequelize);
export const SystemSettings = systemSettingsModel(sequelize);
export const RolePermission = rolePermissionModel(sequelize);
export const Resignation = resignationModel(sequelize);
export const SalaryAdjustment = salaryAdjustmentModel(sequelize);
export const Holiday = holidayModel(sequelize);
export const Document = documentModel(sequelize);

/* ==============================
   EXPORT DB OBJECT
============================== */
export const db = {
  sequelize,
  Role,
  User,
  Company,
  Department,
  Designation,
  Shift,
  Employee,
  EmployeePersonalDetail,
  EmployeeContactDetail,
  EmployeeLegalDetail,
  EmployeeSalary,
  EmployeeEducation,
  EmployeeCertification,
  EmployeeExperience,
  EmployeeEmergencyContact,
  EmployeeDocument,
  EmployeeAsset,
  EmployeeBankDetail,
  Payroll,
  AttendanceLog,
  AttendanceDaily,
  LeaveType,
  LeaveRequest,
  Notification,
  LeaveBalance,
  ZKUser,
  Project,
  EmployeeProject,
  CompanySettings,
  SystemSettings,
  RolePermission,
  Resignation,
  SalaryAdjustment,
  Holiday,
  Document,
};


export {
  Role,
  User,
  Company,
  Payroll,
  AttendanceLog,
  AttendanceDaily,
  LeaveType,
  LeaveRequest,
};

/* ==============================
   INIT ASSOCIATIONS
============================== */
export const initModels = async () => {
  try {
    /* ==============================
       ROLE ↔ USER
    ============================== */
    Role.hasMany(User, {
      foreignKey: "role_id",
      as: "users",
    });

    User.belongsTo(Role, {
      foreignKey: "role_id",
      as: "role",
    });

    /* ==============================
       COMPANY ↔ USER
    ============================== */
    Company.hasMany(User, {
      foreignKey: "companyId",
      as: "users",
    });

    User.belongsTo(Company, {
      foreignKey: "companyId",
      as: "company",
    });

    /* ==============================
       COMPANY ↔ DEPARTMENT
    ============================== */
    Company.hasMany(Department, {
      foreignKey: "companyId",
      as: "departments",
    });

    Department.belongsTo(Company, {
      foreignKey: "companyId",
      as: "company",
    });

    /* ==============================
       COMPANY ↔ DESIGNATION
    ============================== */
    Company.hasMany(Designation, {
      foreignKey: "companyId",
      as: "designations",
    });

    Designation.belongsTo(Company, {
      foreignKey: "companyId",
      as: "company",
    });

    /* ==============================
       DEPARTMENT ↔ DESIGNATION
    ============================== */
    Department.hasMany(Designation, {
      foreignKey: "departmentId",
      as: "designations",
    });

    Designation.belongsTo(Department, {
      foreignKey: "departmentId",
      as: "department",
    });

    /* ==============================
       COMPANY ↔ EMPLOYEE
    ============================== */
    Company.hasMany(Employee, {
      foreignKey: "companyId",
      as: "employees",
    });

    Employee.belongsTo(Company, {
      foreignKey: "companyId",
      as: "company",
    });

    /* ==============================
       DEPARTMENT ↔ EMPLOYEE
    ============================== */
    Department.hasMany(Employee, {
      foreignKey: "departmentId",
      as: "employees",
    });

    Employee.belongsTo(Department, {
      foreignKey: "departmentId",
      as: "department",
    });

    /* ==============================
       DESIGNATION ↔ EMPLOYEE
    ============================== */
    Designation.hasMany(Employee, {
      foreignKey: "designationId",
      as: "employees",
    });

    Employee.belongsTo(Designation, {
      foreignKey: "designationId",
      as: "designation",
    });

    /* ==============================
       USER ↔ EMPLOYEE (Created / Updated)
    ============================== */
    Employee.belongsTo(User, {
      as: "creator",
      foreignKey: "createdBy",
    });

    Employee.belongsTo(User, {
      as: "updater",
      foreignKey: "updatedBy",
    });

    /* ==============================
       EMPLOYEE SELF RELATION (Reporting Manager)
    ============================== */
    Employee.belongsTo(Employee, {
      as: "reportingManager",
      foreignKey: "reportingManagerId",
    });

    /* ==============================
   EMPLOYEE ↔ PERSONAL DETAIL (1:1)
============================== */

    Employee.hasOne(EmployeePersonalDetail, {
      foreignKey: "employeeId",
      as: "personalDetail",
    });

    EmployeePersonalDetail.belongsTo(Employee, {
      foreignKey: "employeeId",
    });

    /* ==============================
   EMPLOYEE ↔ CONTACT DETAIL (1:1)
============================== */

    Employee.hasOne(EmployeeContactDetail, {
      foreignKey: "employeeId",
      as: "contactDetail",
    });

    EmployeeContactDetail.belongsTo(Employee, {
      foreignKey: "employeeId",
    });

    /* ==============================
   EMPLOYEE ↔ LEGAL DETAIL (1:1)
============================== */

    Employee.hasOne(EmployeeLegalDetail, {
      foreignKey: "employeeId",
      as: "legalDetail",
    });

    EmployeeLegalDetail.belongsTo(Employee, {
      foreignKey: "employeeId",
    });

    /* ==============================
   EMPLOYEE ↔ SALARY (1:1)
   ============================== */

    Employee.hasOne(EmployeeSalary, {
      foreignKey: "employeeId",
      as: "salary",
    });

    EmployeeSalary.belongsTo(Employee, {
      foreignKey: "employeeId",
    });

    /* ==============================
   EMPLOYEE ↔ EDUCATION (1:M)
============================== */

    Employee.hasMany(EmployeeEducation, {
      foreignKey: "employeeId",
      as: "educations",
    });

    EmployeeEducation.belongsTo(Employee, {
      foreignKey: "employeeId",
    });

    /* ==============================
       EMPLOYEE ↔ CERTIFICATION (1:M)
    ============================== */

    Employee.hasMany(EmployeeCertification, {
      foreignKey: "employeeId",
      as: "certifications",
    });

    EmployeeCertification.belongsTo(Employee, {
      foreignKey: "employeeId",
    });

    /* ==============================
       EMPLOYEE ↔ EXPERIENCE (1:M)
    ============================== */

    Employee.hasMany(EmployeeExperience, {
      foreignKey: "employeeId",
      as: "experiences",
    });

    EmployeeExperience.belongsTo(Employee, {
      foreignKey: "employeeId",
    });
    /* ==============================
       EMPLOYEE ↔ EMERGENCY CONTACT (1:M)
    ============================== */

    Employee.hasMany(EmployeeEmergencyContact, {
      foreignKey: "employeeId",
      as: "emergencyContacts",
    });

    EmployeeEmergencyContact.belongsTo(Employee, {
      foreignKey: "employeeId",
    });

    /* ==============================
       EMPLOYEE ↔ DOCUMENT (1:M)
    ============================== */

    Employee.hasMany(EmployeeDocument, {
      foreignKey: "employeeId",
      as: "documents",
    });

    EmployeeDocument.belongsTo(Employee, {
      foreignKey: "employeeId",
    });

    /* ==============================
       EMPLOYEE ↔ ASSET (1:M)
    ============================== */

    Employee.hasMany(EmployeeAsset, {
      foreignKey: "employeeId",
      as: "assets",
    });

    EmployeeAsset.belongsTo(Employee, {
      foreignKey: "employeeId",
    });

    /* ==============================
       EMPLOYEE ↔ BANK DETAIL (1:1)
    ============================== */

    Employee.hasOne(EmployeeBankDetail, {
      foreignKey: "employeeId",
      as: "bankDetail",
    });

    EmployeeBankDetail.belongsTo(Employee, {
      foreignKey: "employeeId",
    });

    // Company → LeaveType
    Company.hasMany(LeaveType, { foreignKey: "companyId" });
    LeaveType.belongsTo(Company, { foreignKey: "companyId" });

    // Company → LeaveRequest
    Company.hasMany(LeaveRequest, { foreignKey: "companyId" });
    LeaveRequest.belongsTo(Company, { foreignKey: "companyId" });

    // Employee → LeaveRequest
    Employee.hasMany(LeaveRequest, { foreignKey: "employeeId" });
    LeaveRequest.belongsTo(Employee, { foreignKey: "employeeId" });

    // LeaveType → LeaveRequest
    LeaveType.hasMany(LeaveRequest, { foreignKey: "leaveTypeId" });
    LeaveRequest.belongsTo(LeaveType, { foreignKey: "leaveTypeId" });

    // User (Admin) approves Leave
    User.hasMany(LeaveRequest, { foreignKey: "approvedBy" });
    LeaveRequest.belongsTo(User, { foreignKey: "approvedBy", as: "approver" });

    // LeaveBalance associations
    Employee.hasMany(LeaveBalance, { foreignKey: "employeeId" });
    LeaveBalance.belongsTo(Employee, { foreignKey: "employeeId" });
    LeaveType.hasMany(LeaveBalance, { foreignKey: "leaveTypeId" });
    LeaveBalance.belongsTo(LeaveType, { foreignKey: "leaveTypeId" });


    AttendanceLog.belongsTo(Employee, { foreignKey: "employeeId" });
    AttendanceDaily.belongsTo(Employee, { foreignKey: "employeeId" });

    Employee.belongsTo(Shift, { foreignKey: "shiftId" });
    Shift.hasMany(Employee, { foreignKey: "shiftId" });

    // Payroll Associations

    Company.hasMany(Payroll, { foreignKey: "companyId" });
    Payroll.belongsTo(Company, { foreignKey: "companyId" });

    Employee.hasMany(Payroll, { foreignKey: "employeeId" });
    Payroll.belongsTo(Employee, { foreignKey: "employeeId" });

    // Payroll Associations

    Employee.hasMany(Payroll, { foreignKey: "employeeId" });
    Payroll.belongsTo(Employee, { foreignKey: "employeeId" });

    // Notification Associations
    Company.hasMany(Notification, { foreignKey: "companyId" });
    Notification.belongsTo(Company, { foreignKey: "companyId" });

    User.hasMany(Notification, { foreignKey: "userId" });
    Notification.belongsTo(User, { foreignKey: "userId" });

    Company.hasMany(ZKUser, { foreignKey: "companyId" });
    ZKUser.belongsTo(Company, { foreignKey: "companyId" });

    Employee.hasMany(ZKUser, { foreignKey: "employeeId" });
    ZKUser.belongsTo(Employee, { foreignKey: "employeeId" });

    /* ==============================
       PROJECT ASSOCIATIONS
    ============================== */
    Company.hasMany(Project, { foreignKey: "companyId", as: "projects" });
    Project.belongsTo(Company, { foreignKey: "companyId", as: "company" });

    Employee.hasMany(Project, { foreignKey: "teamLeadId", as: "ledProjects" });
    Project.belongsTo(Employee, { foreignKey: "teamLeadId", as: "teamLead" });

    Project.belongsToMany(Employee, { through: EmployeeProject, foreignKey: "projectId", as: "members" });
    Employee.belongsToMany(Project, { through: EmployeeProject, foreignKey: "employeeId", as: "projects" });

    Project.hasMany(EmployeeProject, { foreignKey: "projectId", as: "projectMembers" });
    EmployeeProject.belongsTo(Project, { foreignKey: "projectId", as: "project" });

    Employee.hasMany(EmployeeProject, { foreignKey: "employeeId", as: "employeeProjects" });
    EmployeeProject.belongsTo(Employee, { foreignKey: "employeeId", as: "employee" });

    /* ==============================
       SETTINGS ASSOCIATIONS
    ============================== */
    Company.hasOne(CompanySettings, { foreignKey: "companyId", as: "settings" });
    CompanySettings.belongsTo(Company, { foreignKey: "companyId" });

    Company.hasMany(SystemSettings, { foreignKey: "companyId", as: "systemSettings" });
    SystemSettings.belongsTo(Company, { foreignKey: "companyId" });

    Shift.hasMany(SystemSettings, { foreignKey: "defaultShiftId" });
    SystemSettings.belongsTo(Shift, { foreignKey: "defaultShiftId", as: "defaultShift" });

    /* ==============================
       SYNC DATABASE
    ============================== */
    await sequelize.sync({ alter: true });

    console.log("✅ Models synchronized successfully");
  } catch (error) {
    console.error("❌ Model synchronization failed:", error.message);
  }
};