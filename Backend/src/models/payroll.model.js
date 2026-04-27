// models/payroll.model.js

import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Payroll = sequelize.define(
  "Payroll",
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

    month: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    basicSalary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    allowances: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    deductions: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    pfDeduction: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    esiDeduction: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    netSalary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    overtimeHours: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    overtimePay: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    paymentStatus: {
      type: DataTypes.ENUM("PENDING", "PAID"),
      defaultValue: "PENDING",
    },

    paidDate: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "payrolls",
    timestamps: true,
  }
);