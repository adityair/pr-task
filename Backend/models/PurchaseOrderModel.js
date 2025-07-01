import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const PurchaseOrder = db.define(
  "purchase_orders",
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
      unique: true,
    },
    po_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    prId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "purchase_requests",
        key: "id",
      },
    },
    assignedTo: {
      type: DataTypes.STRING, // uuid user staff purchasing
      allowNull: true,
      references: {
        model: "users",
        key: "uuid",
      },
    },
    status: {
      type: DataTypes.ENUM(
        "OPEN",
        "ASSIGNED",
        "IN_PROGRESS",
        "COMPLETED",
        "CLOSED",
        "CANCELLED"
      ),
      defaultValue: "OPEN",
    },
    note: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
  }
);

export default PurchaseOrder;
