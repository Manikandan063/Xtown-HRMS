import express from "express";
import cors from "cors";
import path from 'path';
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import dotenv from "dotenv";
dotenv.config();

// Config
import { connectDB } from "./src/config/db.js";
import { initModels } from "./src/models/initModels.js";

// Seeders
import { seedRoles } from "./src/seeders/role.seeder.js";
import { seedSuperAdmin } from "./src/seeders/superAdmin.seeder.js";
import { seedSubscriptionPlans } from "./src/seeders/subscriptionPlan.seeder.js";

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
import holidayRoutes from "./src/modules/holiday/holiday.routes.js";
import assetRoutes from "./src/modules/asset/asset.routes.js";
import checkpointRoutes from "./src/modules/checkpoint/checkpoint.routes.js";
import supportRoutes from "./src/modules/support/support.routes.js";
// Error Handler
import errorMiddleware from "./src/shared/middlewares/error.js";

import { createServer } from "http";
import { Server } from "socket.io";
import { ChatMessage, User } from "./src/models/initModels.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket.io Real-Time Support System
const onlineUsers = new Map(); // userId -> socketId

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    onlineUsers.set(userId, socket.id);
    console.log(`🔌 User connected: ${userId} (${socket.id})`);
    
    // 1. Send the list of current online users to this specific user
    socket.emit("initial_online_users", Array.from(onlineUsers.keys()));

    // 2. Notify others that this user is now online
    socket.broadcast.emit("user_status_change", { userId, status: "online" });
  }

  socket.on("join_ticket", (ticketId) => {
    socket.join(ticketId);
    console.log(`🎟️ User joined ticket room: ${ticketId}`);
  });

  socket.on("send_message", async (data) => {
    const { ticketId, senderId, receiverId, message, attachmentUrl, attachmentType } = data;
    
    try {
      // 1. Save to DB
      const chatMsg = await ChatMessage.create({
        ticketId,
        senderId,
        receiverId,
        message,
        attachmentUrl,
        attachmentType
      });

      // 2. Emit to the ticket room
      io.to(ticketId).emit("new_message", chatMsg);

      // 3. If receiver is not in the room, send a global notification if they are online
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("support_notification", {
          ticketId,
          message: "You have a new support message",
          senderId
        });
      }
    } catch (err) {
      console.error("❌ Socket message error:", err);
    }
  });

  socket.on("typing", (data) => {
    const { ticketId, userId, userName } = data;
    // Using io.to to ensure it reaches everyone in the room
    io.to(ticketId).emit("user_typing", { userId, userName });
  });

  socket.on("stop_typing", (data) => {
    const { ticketId, userId } = data;
    io.to(ticketId).emit("user_stop_typing", { userId });
  });

  socket.on("disconnect", () => {
    if (userId) {
      onlineUsers.delete(userId);
      console.log(`🔌 User disconnected: ${userId}`);
      socket.broadcast.emit("user_status_change", { userId, status: "offline" });
    }
  });
});

// Global Middlewares
app.use(cors()); 
app.use(helmet({ 
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false 
}));
// Rate Limiter configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 1000, 
  standardHeaders: true, 
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use(limiter);

// Static Files (Accessible across origins)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Root Route
app.get("/", (req, res) => {
  res.send("HRMS API Running with Real-Time Support...");
});

// Advanced Request Logger for Browser Debugging
app.use((req, res, next) => {
  const start = Date.now();
  const hasAuth = req.headers.authorization ? "✅ YES" : "❌ NO";
  console.log(`\x1b[36m[INCOMING]\x1b[0m ${req.method} ${req.url} | Auth: ${hasAuth} | Origin: ${req.headers.origin || 'N/A'}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`\x1b[32m[COMPLETE]\x1b[0m ${req.method} ${req.url} | Status: ${res.statusCode} | Duration: ${duration}ms`);
  });
  next();
});

// =====================================================
// 🔹 NORMAL API ROUTES
// =====================================================
app.use("/api/auth", authRoutes);
app.use("/api/v1/auth", authRoutes);

const routes = [
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
  { path: "/holiday", handler: holidayRoutes },
  { path: "/assets", handler: assetRoutes },
  { path: "/checkpoints", handler: checkpointRoutes },
  { path: "/devices", handler: zkRoutes },
  { path: "/support", handler: supportRoutes },
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

const PORT = process.env.PORT || 8080;

// =====================================================
// 🔹 DB + Models + Seed
// =====================================================
const initializeApp = async () => {
  try {
    console.log("📂 Initializing database services...");
    await connectDB();
    await initModels();
    await seedRoles();
    await seedSuperAdmin();
    await seedSubscriptionPlans();
    console.log("✅ All services initialized and ready.");
    
    // Start background jobs ONLY after DB is ready
    import("./src/jobs/zkSync.job.js").then(module => {
      module.startZKSyncJob();
    });
  } catch (error) {
    console.error("❌ CRITICAL: Background initialization failed:", error.message);
  }
};

httpServer.listen(PORT, async () => {
  console.log(`🚀 Real-Time Server running on port ${PORT}`);
  await initializeApp();
});

// Global Error Handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});