import { DataTypes } from "sequelize";

export default (sequelize) => {
  const CompanySettings = sequelize.define(
    "CompanySettings",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      companyId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: "companies",
          key: "id",
        },
      },
      companyName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.TEXT,
      },
      contactEmail: {
        type: DataTypes.STRING,
        validate: {
          isEmail: true,
        },
      },
      contactPhone: {
        type: DataTypes.STRING,
      },
      logoUrl: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: "company_settings",
      timestamps: true,
    }
  );

  return CompanySettings;
};
