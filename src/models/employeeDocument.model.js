import { DataTypes } from "sequelize";

export default (sequelize) => {
  const EmployeeDocument = sequelize.define(
    "EmployeeDocument",
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

      documentType: {
        type: DataTypes.STRING(150),
        allowNull: false,
        // Example: PAN, AADHAAR, RESUME, DEGREE, OFFER_LETTER
      },

      documentName: {
        type: DataTypes.STRING(200),
      },

      filePath: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      uploadedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },

      verificationStatus: {
        type: DataTypes.ENUM("PENDING", "VERIFIED", "REJECTED"),
        defaultValue: "PENDING",
      },

      remarks: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "employee_documents",
      timestamps: true,
      paranoid: true,
    }
  );

  return EmployeeDocument;
};