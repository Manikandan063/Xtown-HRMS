import { DataTypes } from "sequelize";

export default (sequelize) => {
  const EmployeeExperience = sequelize.define(
    "EmployeeExperience",
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

      companyName: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },

      designation: {
        type: DataTypes.STRING(150),
      },

      department: {
        type: DataTypes.STRING(150),
      },

      location: {
        type: DataTypes.STRING(150),
      },

      startDate: {
        type: DataTypes.DATEONLY,
      },

      endDate: {
        type: DataTypes.DATEONLY,
      },

      responsibilities: {
        type: DataTypes.TEXT,
      },

      achievements: {
        type: DataTypes.TEXT,
      },

      relievingDocumentPath: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: "employee_experiences",
      timestamps: true,
      paranoid: true,
    }
  );

  return EmployeeExperience;
};