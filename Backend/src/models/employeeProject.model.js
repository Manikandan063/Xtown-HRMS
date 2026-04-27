import { DataTypes } from "sequelize";

export default (sequelize) => {
  const EmployeeProject = sequelize.define(
    "EmployeeProject",
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
      },
      projectId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "projects",
          key: "id",
        },
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isCurrent: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      assignedDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      removedDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "employee_projects",
      timestamps: true,
    }
  );

  return EmployeeProject;
};
