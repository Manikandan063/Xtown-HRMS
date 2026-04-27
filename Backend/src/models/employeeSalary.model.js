import { DataTypes } from "sequelize";

export default (sequelize) => {
  const EmployeeSalary = sequelize.define(
    "EmployeeSalary",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      employeeId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true, // 1:1 current structure
        references: {
          model: "employees",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      basicSalary: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      hra: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },

      da: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },

      medicalAllowance: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },

      conveyance: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },

      bonus: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },

      incentives: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },

      deductions: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },

      pfAmount: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },

      esiAmount: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },

      netSalary: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      effectiveFrom: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      tableName: "employee_salaries",
      timestamps: true,
      paranoid: true,
    }
  );

  return EmployeeSalary;
};