import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const ZKUser = sequelize.define(
  "ZKUser",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    deviceUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "device_user_id",
    },
    employeeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "zk_users",
    timestamps: true,
  }
);
