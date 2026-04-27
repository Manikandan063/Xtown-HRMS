import { DataTypes } from "sequelize";

export default (sequelize) => {
  const EmployeeAsset = sequelize.define(
    "EmployeeAsset",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      employeeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "employees",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      assetName: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },

      assetCategory: {
        type: DataTypes.STRING(150),
        // Example: LAPTOP, MOBILE, ID_CARD, SIM, VEHICLE
      },

      assetCode: {
        type: DataTypes.STRING(100),
      },

      serialNumber: {
        type: DataTypes.STRING(150),
      },

      assignedDate: {
        type: DataTypes.DATEONLY,
      },

      returnDate: {
        type: DataTypes.DATEONLY,
      },

      conditionAtIssue: {
        type: DataTypes.STRING(150),
      },

      conditionAtReturn: {
        type: DataTypes.STRING(150),
      },

      status: {
        type: DataTypes.ENUM(
          "ASSIGNED",
          "RETURNED",
          "LOST",
          "DAMAGED"
        ),
        defaultValue: "ASSIGNED",
      },

      remarks: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "employee_assets",
      timestamps: true,
      paranoid: true,
    }
  );

  return EmployeeAsset;
};