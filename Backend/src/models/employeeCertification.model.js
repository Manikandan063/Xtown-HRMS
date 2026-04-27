import { DataTypes } from "sequelize";

export default (sequelize) => {
  const EmployeeCertification = sequelize.define(
    "EmployeeCertification",
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

      courseName: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },

      issuingOrganization: {
        type: DataTypes.STRING(200),
      },

      certificateNumber: {
        type: DataTypes.STRING(100),
      },

      issueDate: {
        type: DataTypes.DATEONLY,
      },

      expiryDate: {
        type: DataTypes.DATEONLY,
      },

      documentPath: {
        type: DataTypes.STRING,
      },

      verificationStatus: {
        type: DataTypes.ENUM("PENDING", "VERIFIED", "REJECTED"),
        defaultValue: "PENDING",
      },
    },
    {
      tableName: "employee_certifications",
      timestamps: true,
      paranoid: true,
    }
  );

  return EmployeeCertification;
};