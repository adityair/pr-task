import express from "express";
import {
  getOpenPOs,
  assignPO,
  getAssignedPOs,
  getCompletedPOs,
  getClosedPOs,
  approvePO,
} from "../controllers/PurchaseOrderController.js";
import {
  getItemsByPO,
  checkItem,
  completePO,
} from "../controllers/PurchaseOrderItemController.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/open", verifyUser, getOpenPOs);
router.post("/assign/:poId", verifyUser, assignPO);
router.get("/assigned", verifyUser, getAssignedPOs);
router.get("/completed", verifyUser, getCompletedPOs);
router.get("/closed", verifyUser, getClosedPOs);
router.post("/approve/:poId", verifyUser, approvePO);

// Item PO
router.get("/items/:poId", verifyUser, getItemsByPO);
router.post("/check/:itemId", verifyUser, checkItem);
router.post("/complete/:poId", verifyUser, completePO);

export default (app) => {
  app.use("/api/purchase-order", router);
};
