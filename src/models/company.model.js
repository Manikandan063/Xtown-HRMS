import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Company = sequelize.define(
  "Company",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    address: {
      type: DataTypes.TEXT,
    },
    
    domain: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    registrationNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    subscriptionPlan: {
      type: DataTypes.ENUM("BASIC", "PREMIUM", "ENTERPRISE"),
      defaultValue: "BASIC",
    },

    currentPlanId: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    planStartDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    planExpiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "BLOCKED"),
      defaultValue: "ACTIVE",
    },

    workingStartTime: {
      type: DataTypes.STRING,
      defaultValue: "09:30",
    },

    workingEndTime: {
      type: DataTypes.STRING,
      defaultValue: "17:30",
    },
  },
  {
    tableName: "companies",
    timestamps: true,
  }
);