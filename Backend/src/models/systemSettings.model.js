import { DataTypes } from "sequelize";

export default (sequelize) => {
  const SystemSettings = sequelize.define(
    "SystemSettings",
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
      defaultShiftId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "shifts",
          key: "id",
        },
      },
      workingHoursPerDay: {
        type: DataTypes.FLOAT,
        defaultValue: 8.0,
        validate: {
          min: 0.1,
        },
      },
      payrollCycle: {
        type: DataTypes.ENUM("MONTHLY", "WEEKLY"),
        defaultValue: "MONTHLY",
      },
      currency: {
        type: DataTypes.STRING,
        defaultValue: "INR",
      },
    },
    {
      tableName: "system_settings",
      timestamps: true,
    }
  );

  return SystemSettings;
};
