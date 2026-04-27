import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Employee = sequelize.define(
    "Employee",
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

      employeeCode: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },

      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      officialEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },

      officialPhone: {
        type: DataTypes.STRING(15),
      },

      departmentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "departments",
          key: "id",
        },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      },

      designationId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "designations",
          key: "id",
        },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      },

      reportingManagerId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "employees",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },

      employeeType: {
        type: DataTypes.STRING,
        defaultValue: "PERMANENT",
      },

      isFresher: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },

      workLocation: {
        type: DataTypes.STRING(150),
      },

      shiftId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "shifts",
          key: "id",
        },
      },

      profileImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      dateOfJoining: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      status: {
        type: DataTypes.STRING,
        defaultValue: "ACTIVE",
      },

      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },

      updatedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      welcomeEmailSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "welcome_email_sent"
      },
      canResign: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    },
    {
      tableName: "employees",
      timestamps: true,
      paranoid: true,
      indexes: [
        {
          unique: true,
          fields: ["companyId", "employeeCode"],
        },
        {
          unique: true,
          fields: ["companyId", "officialEmail"],
        },
        {
          unique: true,
          fields: ["companyId", "officialPhone"],
        },
      ],
    }
  );

  return Employee;
};