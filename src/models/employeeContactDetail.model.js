import { DataTypes } from "sequelize";

export default (sequelize) => {
  const EmployeeContactDetail = sequelize.define(
    "EmployeeContactDetail",
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

      personalEmail: {
        type: DataTypes.STRING,
        validate: {
          isEmail: true,
        },
      },

      alternatePhone: {
        type: DataTypes.STRING(15),
      },

      permanentAddress: {
        type: DataTypes.TEXT,
      },

      currentAddress: {
        type: DataTypes.TEXT,
      },

      city: {
        type: DataTypes.STRING(100),
      },

      state: {
        type: DataTypes.STRING(100),
      },

      country: {
        type: DataTypes.STRING(100),
      },

      pincode: {
        type: DataTypes.STRING(10),
      },
    },
    {
      tableName: "employee_contact_details",
      timestamps: true,
      paranoid: true,
    }
  );

  return EmployeeContactDetail;
};