import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const LeaveType = sequelize.define(
  "LeaveType",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    leaveName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    maxDaysPerYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  { timestamps: true }
);