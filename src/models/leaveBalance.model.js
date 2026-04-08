import { DataTypes } from "sequelize";

export default (sequelize) => {
  const LeaveBalance = sequelize.define(
    "LeaveBalance",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      employeeId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      leaveTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      balance: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      used: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "leave_balances",
      timestamps: true,
      uniqueKeys: {
        emp_leave_year: {
          fields: ["employeeId", "leaveTypeId", "year"]
        }
      }
    }
  );

  return LeaveBalance;
};
