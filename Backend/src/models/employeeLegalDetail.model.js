import { DataTypes } from "sequelize";

export default (sequelize) => {
  const EmployeeLegalDetail = sequelize.define(
    "EmployeeLegalDetail",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      employeeId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true, // 1:1
        references: {
          model: "employees",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      panNumber: {
        type: DataTypes.STRING(20),
      },

      aadhaarNumber: {
        type: DataTypes.STRING(20),
      },

      pfNumber: {
        type: DataTypes.STRING(50),
      },

      esiNumber: {
        type: DataTypes.STRING(50),
      },

      taxCategory: {
        type: DataTypes.STRING(100),
      },

      tdsApplicable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "employee_legal_details",
      timestamps: true,
      paranoid: true,
    }
  );

  return EmployeeLegalDetail;
};