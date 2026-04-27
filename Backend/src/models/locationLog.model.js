import { DataTypes } from "sequelize";

export default (sequelize) => {
  const LocationLog = sequelize.define(
    "LocationLog",
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
      employeeId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: false,
      },
      longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("INSIDE", "OUTSIDE"),
        allowNull: false,
      },
      distance: {
        type: DataTypes.FLOAT, // Distance from checkpoint in meters
        allowNull: true,
      },
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "location_logs",
      timestamps: true,
    }
  );

  return LocationLog;
};
