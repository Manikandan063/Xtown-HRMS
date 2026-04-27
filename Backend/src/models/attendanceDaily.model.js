import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const AttendanceDaily = sequelize.define(
  "AttendanceDaily",
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

    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    firstIn: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    lastOut: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    totalHours: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    status: {
      type: DataTypes.ENUM("PRESENT", "ABSENT", "HALF_DAY", "LEAVE", "HOLIDAY"),
      defaultValue: "ABSENT",
    },

    lateMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    overtimeHours: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
  },
  {
    tableName: "attendance_daily",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["employeeId", "date"],
      },
    ],
  }
);