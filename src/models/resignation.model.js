import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Resignation = sequelize.define(
    "Resignation",
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
        allowNull: false,
      },
      reason: {
        type: DataTypes.TEXT,
      },
      noticePeriod: {
        type: DataTypes.INTEGER,
        field: "notice_period",
      },
      lastWorkingDate: {
        type: DataTypes.DATEONLY,
        field: "last_working_date",
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "pending",
      },
      finalSettlementAmount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.0,
        field: "final_settlement_amount",
      },
      settlementStatus: {
        type: DataTypes.STRING,
        defaultValue: "pending",
        field: "settlement_status",
      },
    },
    {
      tableName: "resignations",
      timestamps: true,
      underscored: true,
    }
  );

  return Resignation;
};
