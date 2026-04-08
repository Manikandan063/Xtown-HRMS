import { DataTypes } from "sequelize";

export default (sequelize) => {
  const EmployeeEmergencyContact = sequelize.define(
    "EmployeeEmergencyContact",
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

      contactName: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },

      relationship: {
        type: DataTypes.STRING(100),
      },

      phoneNumber: {
        type: DataTypes.STRING(20),
      },

      alternatePhone: {
        type: DataTypes.STRING(20),
      },

      address: {
        type: DataTypes.TEXT,
      },

      isPrimary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "employee_emergency_contacts",
      timestamps: true,
      paranoid: true,
    }
  );

  return EmployeeEmergencyContact;
};