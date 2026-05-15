# XTOWN HRMS Backend

Backend API for the XTOWN Human Resource Management System. Built with Node.js, Express, Sequelize, and PostgreSQL.

## Features

- **Role-Based Access Control (RBAC)**: Secure access for SuperAdmins, Admins, and Employees.
- **Biometric Integration**: Automated synchronization with ZK Biometric devices.
- **Real-Time Support System**: Integrated Chat and Support Ticket system using Socket.io.
- **Modular Architecture**: Clean separation of concerns with modules for Auth, Employee, Payroll, Attendance, etc.
- **Automated Seeding**: Quick setup with predefined roles and superadmin credentials.

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js (v5)
- **ORM**: Sequelize
- **Database**: PostgreSQL
- **Real-time**: Socket.io
- **Validation**: Zod
- **Security**: Helmet, Express Rate Limit, BcryptJS

## Getting Started

### Prerequisites

- Node.js installed
- PostgreSQL database running

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your database and email credentials
4. Initialize the database:
   ```bash
   npm run migrate
   npm run seed
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

The API endpoints are structured under `/api/v1/`. Key modules include:

- `/auth`: Login, Forgot Password, Profile management.
- `/employees`: Full CRUD for employee records and personal details.
- `/attendance`: Logs and daily summaries from biometric devices.
- `/payroll`: Salary generation and slips.
- `/support`: Ticketing and real-time chat.

## License

ISC