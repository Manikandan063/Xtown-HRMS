import asyncHandler from "../../shared/asyncHandler.js";
import { createNotificationSchema } from "./notification.schema.js";
import {
  createNotification,
  getUserNotifications,
  markAsRead,
  getUnreadCount,
  markAllAsRead,
} from "./notification.service.js";

export const createNotificationController = asyncHandler(async (req, res) => {
  const validated = createNotificationSchema.parse(req.body);

  const notification = await createNotification({
    ...validated,
    companyId: req.user.companyId,
  });

  res.status(201).json({
    success: true,
    data: notification,
  });
});


export const markNotificationReadController = asyncHandler(async (req, res) => {
  const notification = await markAsRead(req.params.id);

  res.json({
    success: true,
    message: "Marked as read",
    data: notification,
  });
});

export const getUnreadCountController = asyncHandler(async (req, res) => {
  const count = await getUnreadCount(
    req.user.companyId,
    req.user.id
  );

  res.json({
    success: true,
    unreadCount: count,
  });
});

export const markAllAsReadController = asyncHandler(async (req, res) => {
  await markAllAsRead(req.user.companyId, req.user.id);

  res.json({
    success: true,
    message: "All notifications marked as read",
  });
});
export const getMyNotificationsController = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await getUserNotifications(
    req.user.companyId,
    req.user.id,
    page,
    limit
  );

  res.json({
    success: true,
    total: result.count,
    page,
    totalPages: Math.ceil(result.count / limit),
    data: result.rows,
  });
});