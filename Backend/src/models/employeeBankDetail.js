import { DataTypes } from "sequelize";

const EmployeeBankDetail = (sequelize) => {
  const EmployeeBankDetailModel = sequelize.define(
    "EmployeeBankDetail",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      employeeId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true, // 1:1 relationship
      },

      bankName: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      accountHolderName: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      accountNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      ifscCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      branchName: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      accountType: {
        type: DataTypes.ENUM("SAVINGS", "CURRENT", "SALARY"),
        defaultValue: "SAVINGS",
      },
    },
    {
      tableName: "employee_bank_details",
      timestamps: true,
      paranoid: true,
    }
  );

  return EmployeeBankDetailModel;
};

export default EmployeeBankDetail;