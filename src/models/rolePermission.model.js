import { DataTypes } from "sequelize";

export default (sequelize) => {
  const RolePermission = sequelize.define(
    "RolePermission",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      canCreateEmployee: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      canApproveLeave: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      canProcessPayroll: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "role_permissions",
      timestamps: true,
    }
  );

  return RolePermission;
};
