import { DataTypes } from "sequelize";

export default (sequelize) => {
  const SalaryAdjustment = sequelize.define(
    "SalaryAdjustment",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      employeeId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "employee_id",
      },
      type: {
        type: DataTypes.ENUM("increment", "decrement"),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      reason: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "salary_adjustments",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );

  return SalaryAdjustment;
};
