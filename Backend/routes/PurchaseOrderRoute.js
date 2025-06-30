import express from "express";
import { getOpenPOs, assignPO, getAssignedPOs } from "../controllers/PurchaseOrderController.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/open", verifyUser, getOpenPOs);
router.post("/:poId/assign", verifyUser, assignPO);
router.get("/assigned", verifyUser, getAssignedPOs);    

export default (app) => {
  app.use("/api/purchase-order", router);
};

