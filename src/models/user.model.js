import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Role } from "./role.model.js";

export const User = sequelize.define(
  "User",
  {
    id: {
  type: DataTypes.UUID,
  defaultValue: DataTypes.UUIDV4,
  primaryKey: true,
},
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "roles",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: true, // super_admin may not need company
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    designation: {
      type: DataTypes.STRING(50),
      allowNull: true, // "HR", "MD" or null
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);
