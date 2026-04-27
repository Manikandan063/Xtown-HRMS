import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const SubscriptionRequest = sequelize.define(
  "SubscriptionRequest",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    planName: {
      type: DataTypes.ENUM("BASIC", "PREMIUM", "ENTERPRISE"),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
      defaultValue: "PENDING",
    },
    paymentReference: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    processedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    }
  },
  {
    tableName: "subscription_requests",
    timestamps: true,
  }
);
