import { db } from "../../models/initModels.js";

const { Notification } = db;

import { sendEmail } from "../../shared/utils/emailSender.js";

export const createNotification = async (data, sendEmailFlag = false) => {
  const notification = await Notification.create(data);
  
  if (sendEmailFlag && data.email) {
      await sendEmail(data.email, data.title, data.message, `<p>${data.message}</p>`);
  }
  
  return notification;
};


export const markAsRead = async (id) => {
  const notification = await Notification.findByPk(id);
  if (!notification) throw new Error("Notification not found");

  notification.isRead = true;
  await notification.save();

  return notification;
};

export const getUnreadCount = async (companyId, userId) => {
  return await Notification.count({
    where: {
      companyId,
      userId,
      isRead: false,
    },
  });
};
export const markAllAsRead = async (companyId, userId) => {
  await Notification.update(
    { isRead: true },
    {
      where: {
        companyId,
        userId,
        isRead: false,
      },
    }
  );

  return true;
};

export const getUserNotifications = async (
  companyId,
  userId,
  page = 1,
  limit = 10
) => {
  const offset = (page - 1) * limit;

  return await Notification.findAndCountAll({
    where: { companyId, userId },
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });
};