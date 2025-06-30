import express from "express";
import { getAllApprovals, getUserApprovals, approvePR, rejectPR, getApprovalStatus, getOpenPOs } from "../controllers/ApprovalController.js";
import { verifyUser, adminOnly } from "../middleware/AuthUser.js";

const router = express.Router();

// Untuk admin: lihat semua approval
router.get("/", verifyUser, adminOnly, getAllApprovals);

router.get("/list", verifyUser, adminOnly, getAllApprovals);

// Untuk user: lihat approval yang harus dia approve
router.get("/user", verifyUser, getUserApprovals);

// Approve PR
router.post("/:prId/approve", verifyUser, approvePR);

// Reject PR
router.post("/:prId/reject", verifyUser, rejectPR);

// Lihat status approval untuk 1 PR
router.get("/:prId/status", verifyUser, getApprovalStatus);

router.get("/po/open", verifyUser, getOpenPOs);

export default (app) => {
  app.use("/api/approvals", router);
};
