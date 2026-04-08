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
  },
  {
    tableName: "attendance_logs",
    timestamps: true,
  }
);