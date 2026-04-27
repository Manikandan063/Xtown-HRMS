import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const SubscriptionPlan = sequelize.define(
  "SubscriptionPlan",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    maxEmployees: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    features: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    durationDays: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    }
  },
  {
    tableName: "subscription_plans",
    timestamps: true,
  }
);
