import { DataTypes } from "sequelize";

export const supportTicketModel = (sequelize) => {
  return sequelize.define("SupportTicket", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ticketId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    issueTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    issueDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM("UI", "Backend", "Database"),
      defaultValue: "UI",
    },
    priority: {
      type: DataTypes.ENUM("Low", "Medium", "High"),
      defaultValue: "Medium",
    },
    status: {
      type: DataTypes.ENUM("Open", "In Progress", "Resolved"),
      defaultValue: "Open",
    },
    assignedTo: {
      type: DataTypes.UUID,
      allowNull: true, // SuperAdmin ID
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 1, max: 5 }
    },
    ratingFeedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  }, {
    timestamps: true,
    tableName: "support_tickets",
  });
};
