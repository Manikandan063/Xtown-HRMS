import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Holiday = sequelize.define(
    "Holiday",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      companyId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "company_id",
      },
      holidayName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "holiday_name",
      },
      holidayDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "holiday_date",
      },
      description: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "holidays",
      timestamps: true,
      underscored: true,
    }
  );

  return Holiday;
};
