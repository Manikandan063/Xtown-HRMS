import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Config
import { connectDB } from "./src/config/db.js";
import { initModels } from "./src/models/initModels.js";

// Seeders
import { seedRoles } from "./src/seeders/role.seeder.js";
import { seedSuperAdmin } from "./src/seeders/superAdmin.seeder.js";

// Routes
import authRoutes from "./src/modules/auth/auth.routes.js";
import companyRoutes from "./src/modules/company/company.routes.js";
import departmentRoutes from "./src/modules/department/department.routes.js";
import usersRoutes from "./src/modules/users/users.routes.js";
import designationRoutes from "./src/modules/designation/designation.routes.js";
import employeeRoutes from "./src/modules/employee/employee.routes.js";
import leaveRoutes from "./src/modules/leave/leave.routes.js";
import payrollRoutes from "./src/modules/payroll/payroll.routes.js";
import zkRoutes from "./src/modules/device/zk.routes.js";
import reportsRoutes from "./src/modules/reports/reports.routes.js";
import dashboardRoutes from "./src/modules/dashboard/dashboard.routes.js";
import analyticsRoutes from "./src/modules/analytics/analytics.routes.js";
import notificationRoutes from "./src/modules/notification/notification.routes.js";
import resignationRoutes from "./src/modules/resignation/resignation.routes.js";
import shiftRoutes from "./src/modules/shift/shift.routes.js";
import documentRoutes from "./src/modules/document/document.routes.js";
import projectRoutes from "./src/modules/project/project.routes.js";
import attendanceRoutes from "./src/modules/attendance/attendance.routes.js";
import subscriptionRoutes from "./src/modules/subscription/subscription.routes.js";
// Error Handler
import errorMiddleware from "./src/shared/errorMiddleware.js";

dotenv.config();

const app = express();

// =====================================================
// 🔹 GLOBAL MIDDLEWARES (FOR NORMAL JSON APIs)
// =====================================================
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Root Route
app.get("/", (req, res) => {
  res.send("HRMS API Running...");
});

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const PORT = process.env.PORT || 5000;

// =====================================================
// 🔹 DB + Models + Seed
// =====================================================
await connectDB();
await initModels();
await seedRoles();
await seedSuperAdmin();

// (Tables are now initialized via initModels which calls sequelize.sync())

// (createTable calls removed as centralization handles this)

// =====================================================
// 🔥 ZKTeco ADMS ROUTE (TEXT BODY ONLY FOR DEVICE)
// =====================================================
app.use(
  "/",
  express.text({ type: "*/*", limit: "10mb" }), // Device sends text/plain
  zkRoutes
);

// =====================================================
// 🔹 NORMAL API ROUTES
// =====================================================
const routes = [
  { path: "/auth", handler: authRoutes },
  { path: "/companies", handler: companyRoutes },
  { path: "/departments", handler: departmentRoutes },
  { path: "/users", handler: usersRoutes },
  { path: "/designations", handler: designationRoutes },
  { path: "/employees", handler: employeeRoutes },
  { path: "/leave", handler: leaveRoutes },
  { path: "/payroll", handler: payrollRoutes },
  { path: "/reports", handler: reportsRoutes },
  { path: "/dashboard", handler: dashboardRoutes },
  { path: "/analytics", handler: analyticsRoutes },
  { path: "/notification", handler: notificationRoutes },
  { path: "/resignation", handler: resignationRoutes },
  { path: "/shift", handler: shiftRoutes },
  { path: "/document", handler: documentRoutes },
  { path: "/project", handler: projectRoutes },
  { path: "/attendance", handler: attendanceRoutes },
  { path: "/subscription", handler: subscriptionRoutes },
];

routes.forEach(route => {
  app.use(`/api${route.path}`, route.handler);
  app.use(`/api/v1${route.path}`, route.handler);
});

// =====================================================
// 🔹 404 Handler
// =====================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found on this server`,
  });
});

// =====================================================
// 🔹 Global Error Handler
// =====================================================
app.use(errorMiddleware);

// =====================================================
// 🔹 Background Jobs
// =====================================================
import { startZKSyncJob } from "./src/jobs/zkSync.job.js";
startZKSyncJob();

// =====================================================
// 🔹 Start Server
// =====================================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});