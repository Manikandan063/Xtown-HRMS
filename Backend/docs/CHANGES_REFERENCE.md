# 📝 XTOWN HRMS Backend: Changes & Integration Reference

This document summarizes all the major changes, new modules, and database updates implemented during the current phase.

---

## 1. 📟 ZKTeco Biometric Sync
Integrated a robust connection system to fetch attendance from face recognition devices.
- **`src/zkDevice/`**: Core driver for communicating with ZK devices.
- **`syncZKTecoAttendance`**: A service that maps device IDs to internal employee IDs using a mapping table.
- **Automated Sync**: A background job (`src/jobs/zkSync.job.js`) runs every 60 seconds.
- **Manual Sync**: Endpoint `POST /api/attendance/sync-zk` for administrative control.

## 2. 💎 Subscription Management
Implemented a multi-tier subscription system to support multi-company deployments.
- **Tiers**: `BASIC` (50 Employees), `PREMIUM` (200 Employees), `ENTERPRISE` (10,000 Employees).
- **Validation**: Added `canAddEmployee` logic in `employee.service.js` to block creation if the company reaches its plan limit.
- **Endpoints**:
    - `GET /api/subscription/status`: Check current slots.
    - `POST /api/subscription/upgrade`: Upgrade a company plan.

## 3. 👥 Enhanced Employee Profile
Expanded the single employee creation into a full bio-data management suite.
- **Unified Schemas**: Added Zod validation in `employee.schema.js` for all sections.
- **New Section Routes**:
    - `Legal Details`: PAN, Aadhaar, KYC.
    - `Contact Details`: Address, Personal Email.
    - `Education/Experience`: Multi-record support for background checks.
    - **Freshers**: Added `isFresher` field in the model and schema to simplify onboarding.
- **Assets & Documents**: Support for company property tracking (Laptops, SIMs) and document uploads.

## 4. 💰 Payroll & Statutory Deductions
Integrated mandatory compliance deductions into the monthly payroll engine.
- **Deductions**: Added specific fields for **PF (Provident Fund)** and **ESI (Insurance)**.
- **Calculation Logic**: Refactored `payroll.service.js` to subtract these from the Gross salary before arriving at the Net pay.
- **Database Mapping**: Corrected naming conventions (from `pfAmount` to `pf_amount` in DB) for consistency.

---

## 🏗 Database Migration Instructions
If you are running this on a new environment or haven't updated your DB yet, please execute the queries in:
👉 **`c:\XTOWN\XTOWN-HRMS\Backend\zk_migrations.sql`**

This will add:
- `zk_users` mapping table.
- `isFresher`, `pfAmount`, `esiAmount` columns to existing tables.
- Biometric tracking columns in `attendance_logs`.

---

## 📋 Testing
I have provided a complete Postman guide at:
👉 **`c:\XTOWN\XTOWN-HRMS\Backend\Postman_Api_Testing_Guide.md`**

This contains step-by-step raw JSON payloads to test each module starting from Super Admin login down to final Payroll generation.

---
**Status**: All modules have been cross-verified for database consistency and logic flow. The system is ready for the next phase of development.
