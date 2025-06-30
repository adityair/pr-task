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

// Untuk admin: lihat semua approval
router.get("/", verifyUser, adminOnly, getAllApprovals);

router.get("/list", verifyUser, adminOnly, getAllApprovals);

// Untuk user: lihat approval yang harus dia approve
router.get("/user", verifyUser, getUserApprovals);

// Approve PR
router.post("/approve/:prId", verifyUser, approvePR);

// Reject PR
router.post("/reject/:prId", verifyUser, rejectPR);

// Lihat status approval untuk 1 PR
router.get("/status/:prId", verifyUser, getApprovalStatus);

// Lihat riwayat approval lengkap untuk 1 PR
router.get("/history/:prId", verifyUser, getApprovalHistory);

router.get("/po/open", verifyUser, getOpenPOs);

export default (app) => {
  app.use("/api/approvals", router);
};
