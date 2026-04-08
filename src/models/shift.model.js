import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Shift = sequelize.define(
    "Shift",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      companyId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      shiftName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      startTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },

      endTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },

      graceMinutes: {
        type: DataTypes.INTEGER,
        defaultValue: 15,
      },

      fullDayHours: {
        type: DataTypes.FLOAT,
        defaultValue: 8,
      },

      halfDayHours: {
        type: DataTypes.FLOAT,
        defaultValue: 4,
      },
    },
    {
      tableName: "shifts",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["companyId", "shiftName"],
        },
      ],
    }
  );

  return Shift;
};