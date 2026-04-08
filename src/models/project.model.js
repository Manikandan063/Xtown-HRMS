import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Project = sequelize.define(
    "Project",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      companyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "companies",
          key: "id",
        },
      },
      projectName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      projectStatus: {
        type: DataTypes.ENUM("NOT_STARTED", "IN_PROGRESS", "COMPLETED", "ON_HOLD"),
        defaultValue: "NOT_STARTED",
      },
      progressPercentage: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100,
        },
      },
      teamLeadId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "employees",
          key: "id",
        },
      },
      startDate: {
        type: DataTypes.DATE,
      },
      endDate: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "projects",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["companyId", "projectName"],
        },
      ],
    }
  );

  return Project;
};
