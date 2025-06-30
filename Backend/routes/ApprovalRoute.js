import express from "express";
import {
  getAllApprovals,
  getUserApprovals,
  approvePR,
  rejectPR,
  getApprovalStatus,
  getApprovalHistory,
  getOpenPOs,
} from "../controllers/ApprovalController.js";
import { verifyUser, adminOnly } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/", verifyUser, adminOnly, getAllApprovals);

router.get("/list", verifyUser, adminOnly, getAllApprovals);

router.get("/user", verifyUser, getUserApprovals);

router.post("/approve/:prId", verifyUser, approvePR);

router.post("/reject/:prId", verifyUser, rejectPR);

router.get("/status/:prId", verifyUser, getApprovalStatus);

router.get("/history/:prId", verifyUser, getApprovalHistory);

router.get("/po/open", verifyUser, getOpenPOs);

export default (app) => {
  app.use("/api/approvals", router);
}; 