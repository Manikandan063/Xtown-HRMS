# 🚀 HRMS API Postman Testing Guide

This guide contains complete Postman body raw JSONs for testing all API routes in the XTOWN-HRMS system.

---

## 🔑 Authentication
All routes except Login require a Bearer Token in the `Authorization` header.
**Header Format:** `Authorization: Bearer <your_token>`

### 1. Auth Module (STEP 1)
**Route:** `POST /api/auth/login`
```json
{
  "email": "superadmin@hrms.com",
  "password": "Password@123"
}
```

---

## 🏢 Company & Structure (STEP 2)

### 2. Create Company
**Route:** `POST /api/companies`
```json
{
  "companyName": "XTOWN Solutions",
  "email": "contact@xtown.com",
  "phone": "+919876543210",
  "address": "123 Business Park, Tech City",
  "subscriptionPlan": "BASIC"
}
```

---

## 👥 Employee Management (STEP 3)

### 3. Create Employee
**Route:** `POST /api/employees`
```json
{
  "employeeCode": "EMP101",
  "firstName": "Manik",
  "lastName": "Sarma",
  "officialEmail": "manik@xtown.com",
  "officialPhone": "9876543210",
  "departmentId": "PASTE_DEPT_UUID_HERE",
  "designationId": "PASTE_DESIG_UUID_HERE",
  "shiftId": "PASTE_SHIFT_UUID_HERE",
  "employeeType": "PERMANENT",
  "dateOfJoining": "2024-01-01"
}
```

---

## 📂 Employee Profile Sections (STEP 4)
*Update individual sections of an existing employee by their ID.*

### 4. Contact Details
**Route:** `PUT /api/employees/:id/contact`
```json
{
  "personalEmail": "manik.personal@gmail.com",
  "alternatePhone": "9000012345",
  "permanentAddress": "12, MG Road, Pune",
  "currentAddress": "Flat 402, Highrise Apts, Pune",
  "city": "Pune",
  "state": "Maharashtra",
  "pincode": "411001"
}
```

### 5. Legal Details (KYC)
**Route:** `PUT /api/employees/:id/legal`
```json
{
  "panNumber": "ABCDE1234F",
  "aadhaarNumber": "1234-5678-9012",
  "pfNumber": "MH/PUN/12345",
  "esiNumber": "31-00-123456-001-0001",
  "taxCategory": "Old Tax Regime",
  "tdsApplicable": true
}
```

### 6. Education Update
**Route:** `PUT /api/employees/:id/education`
```json
{
  "degree": "B.Tech in Computer Science",
  "institutionName": "IIT Bombay",
  "university": "IIT",
  "startDate": "2012-06-01",
  "endDate": "2016-05-31",
  "percentageOrCGPA": "8.5"
}
```

### 7. Emergency Contact
**Route:** `PUT /api/employees/:id/emergency`
```json
{
  "contactName": "Sunita Sarma",
  "relationship": "Mother",
  "phoneNumber": "9888877777",
  "email": "sunita@gmail.com"
}
```

### 8. Work Experience
**Route:** `PUT /api/employees/:id/experience`
*For Experienced:*
```json
{
  "isFresher": false,
  "companyName": "Tech Giant Corp",
  "designation": "Software Developer",
  "startDate": "2016-07-01",
  "endDate": "2020-12-31",
  "location": "Bangalore"
}
```
*For Fresher:*
```json
{
  "isFresher": true
}
```

### 9. Salary Setup
**Route:** `PUT /api/employees/:id/salary`
```json
{
  "basicSalary": 40000,
  "hra": 15000,
  "da": 5000,
  "medicalAllowance": 2000,
  "conveyance": 3000,
  "pfAmount": 1800,
  "esiAmount": 500,
  "netSalary": 62700,
  "effectiveFrom": "2024-01-01"
}
```

### 10. Certification Update
**Route:** `PUT /api/employees/:id/certification`
```json
{
  "courseName": "AWS Certified Solutions Architect",
  "issuingOrganization": "Amazon Web Services",
  "certificateNumber": "AWS-12345",
  "issueDate": "2023-01-15",
  "expiryDate": "2026-01-15"
}
```

### 11. Asset Allocation
**Route:** `PUT /api/employees/:id/asset`
```json
{
  "assetName": "MacBook Pro M2",
  "assetCategory": "Laptop",
  "assetCode": "LP-XT-001",
  "serialNumber": "SN123456789",
  "assignedDate": "2024-01-02",
  "conditionAtIssue": "New"
}
```

---

## 📟 ZKTeco Attendance (STEP 5)

### 12. Manual Sync
**Route:** `POST /api/attendance/sync-zk`
```json
{
  "ip": "192.168.1.201",
  "port": 4370,
  "companyId": "PASTE_COMPANY_UUID_HERE"
}
---

## 📊 Reports & Analytics (STEP 6)
*All reports are GET requests with optional query filters.*

### 13. Employee Detail Report
**Route:** `GET /api/reports/employees`
*Query Params (Optional): `departmentId`, `page`, `limit`*

### 14. Attendance Report
**Route:** `GET /api/reports/attendance`
*Query Params: `dateFrom=2024-03-01&dateTo=2024-03-31&employeeId=...`*

### 15. Leave Activity Report
**Route:** `GET /api/reports/leaves`
*Query Params: `dateFrom=2024-01-01&dateTo=2024-12-31`*

### 16. Monthly Payroll Report
**Route:** `GET /api/reports/payroll`
*Query Params: `month=2024-03`*
