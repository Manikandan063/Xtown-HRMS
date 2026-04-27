import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Terminal = sequelize.define(
    "Terminal",
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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ip: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      port: {
        type: DataTypes.INTEGER,
        defaultValue: 4370,
      },
      serialNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "ACTIVE", // ACTIVE, INACTIVE
      },
      lastSync: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "terminals",
      timestamps: true,
    }
  );

  return Terminal;
};
