import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Approval = db.define(
  "approvals",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    prId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    approverId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "users",
        key: "uuid",
      },
    },
    level: {
      type: DataTypes.ENUM("L1", "L2", "L3"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
      defaultValue: "PENDING",
    },
    comment: {
      type: DataTypes.STRING,
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Timestamp when approval was made",
    },
  },
  {
    freezeTableName: true,
  }
);

export default Approval;
