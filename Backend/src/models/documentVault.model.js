import { DataTypes } from "sequelize";

export const documentVaultModel = (sequelize) => {
  return sequelize.define("DocumentVault", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    documentName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    documentType: {
      type: DataTypes.ENUM(
        "Aadhaar Card",
        "PAN Card",
        "Resume / CV",
        "Educational Certificates",
        "Offer Letter",
        "Experience Letter",
        "Salary Slips",
        "Address Proof",
        "Bank Passbook / Cancelled Cheque",
        "Other"
      ),
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    verificationStatus: {
      type: DataTypes.ENUM("Pending", "Verified", "Rejected"),
      defaultValue: "Pending",
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    timestamps: true,
    tableName: "document_vault",
  });
};
