import { DataTypes } from "sequelize";

export const supportMessageModel = (sequelize) => {
  return sequelize.define("SupportMessage", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: true, // Null for system bot
    },
    receiverId: {
      type: DataTypes.UUID,
      allowNull: true, // Null if sent to bot or generic support queue
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("user", "bot", "superadmin"),
      defaultValue: "user",
    },
    status: {
      type: DataTypes.ENUM("sent", "delivered", "read", "resolved"),
      defaultValue: "sent",
    },
    isForwarded: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  }, {
    timestamps: true,
    tableName: "support_messages",
  });
};
