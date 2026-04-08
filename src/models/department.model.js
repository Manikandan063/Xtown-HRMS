import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Department = sequelize.define(
    "Department",
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
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      description: {
        type: DataTypes.STRING(255),
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "departments",
      timestamps: true,
      paranoid: true,
      indexes: [
        {
          unique: true,
          fields: ["companyId", "name"],
        },
      ],
    }
  );

  return Department;
};