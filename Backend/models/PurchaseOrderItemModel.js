import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const PurchaseOrderItem = db.define(
  "purchase_order_items",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    poId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "purchase_orders",
        key: "id",
      },
    },
    item_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "BOUGHT"),
      defaultValue: "PENDING",
    },
    note: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
  }
);

// Sinkronisasi model dengan database (otomatis create/alter table)
// db.sync({ alter: true });

export default PurchaseOrderItem;
