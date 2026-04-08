import { DataTypes } from "sequelize";

export default (sequelize) => {
  const EmployeeEducation = sequelize.define(
    "EmployeeEducation",
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

      degree: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },

      institutionName: {
        type: DataTypes.STRING(200),
      },

      university: {
        type: DataTypes.STRING(200),
      },

      startDate: {
        type: DataTypes.DATEONLY,
      },

      endDate: {
        type: DataTypes.DATEONLY,
      },

      percentageOrCGPA: {
        type: DataTypes.STRING(20),
      },
    },
    {
      tableName: "employee_educations",
      timestamps: true,
      paranoid: true,
    }
  );

  return EmployeeEducation;
};