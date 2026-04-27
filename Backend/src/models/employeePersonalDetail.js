import { DataTypes } from "sequelize";

export default (sequelize) => {
  const EmployeePersonalDetail = sequelize.define(
    "EmployeePersonalDetail",
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
        references: {
          model: "employees",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      dateOfBirth: {
        type: DataTypes.DATEONLY,
      },

      gender: {
        type: DataTypes.ENUM("MALE", "FEMALE", "OTHER"),
      },

      maritalStatus: {
        type: DataTypes.ENUM(
          "SINGLE",
          "MARRIED",
          "DIVORCED",
          "WIDOWED"
        ),
      },

      bloodGroup: {
        type: DataTypes.STRING(10),
      },

      nationality: {
        type: DataTypes.STRING(100),
      },

      profileImage: {
        type: DataTypes.STRING, // store image URL/path
      },
    },
    {
      tableName: "employee_personal_details",
      timestamps: true,
      paranoid: true,
    }
  );

  return EmployeePersonalDetail;
};