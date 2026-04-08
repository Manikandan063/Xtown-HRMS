import express from "express";
import {
  createNotificationController,
  getMyNotificationsController,
  markNotificationReadController,
  getUnreadCountController,
  markAllAsReadController,
} from "./notification.controller.js";
import authMiddleware from "../../shared/middlewares/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createNotificationController);
router.get("/me", getMyNotificationsController);
router.patch("/:id/read", markNotificationReadController);
router.get("/unread-count", getUnreadCountController);
router.patch("/mark-all-read", markAllAsReadController);

export default router;