import { DataTypes } from "sequelize";

export default (sequelize) => {
  const ExitChecklist = sequelize.define(
    "ExitChecklist",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      resignationId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "resignation_id",
      },
      task: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "PENDING", // PENDING, COMPLETED
      },
      completedAt: {
        type: DataTypes.DATE,
        field: "completed_at",
      },
      remarks: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "exit_checklists",
      timestamps: true,
      underscored: true,
    }
  );

  return ExitChecklist;
};
