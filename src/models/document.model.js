import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Document = sequelize.define(
    "Document",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      employeeId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "employee_id",
      },
      companyId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "company_id",
      },
      documentType: {
        type: DataTypes.STRING(50),
        field: "document_type",
      },
      fileUrl: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "file_url",
      },
      uploadedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "uploaded_at",
      },
    },
    {
      tableName: "documents",
      timestamps: false,
    }
  );

  return Document;
};
