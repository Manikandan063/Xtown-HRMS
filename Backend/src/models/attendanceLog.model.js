import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const AttendanceLog = sequelize.define(
  "AttendanceLog",
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

    employeeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    deviceId: {
      type: DataTypes.STRING,
      allowNull: true, // null for manual
    },

    punchTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    punchType: {
      type: DataTypes.ENUM("IN", "OUT"),
      allowNull: false,
    },

    source: {
      type: DataTypes.ENUM("DEVICE", "MANUAL"),
      defaultValue: "DEVICE",
    },

    method: {
      type: DataTypes.STRING(20),
      defaultValue: "face",
    },

    deviceUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "device_user_id",
    },

    reason: {
      type: DataTypes.STRING,
      allowNull: true, // only for manual entries or fallback
    },

    location: {
      type: DataTypes.JSON, // { lat: number, lng: number, address: string }
      allowNull: true,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    checkpointId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    locationStatus: {
      type: DataTypes.ENUM("VALID", "OUTSIDE"),
      defaultValue: "VALID",
    },
    approvalStatus: {
      type: DataTypes.ENUM("AUTO", "PENDING", "APPROVED", "REJECTED"),
      defaultValue: "AUTO",
    },
  },
  {
    tableName: "attendance_logs",
    timestamps: true,
  }
);