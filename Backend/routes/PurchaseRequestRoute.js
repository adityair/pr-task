import express from "express";
import { createPurchaseRequest, submitPurchaseRequest, approvePurchaseRequest, getPurchaseRequestsList, getPurchaseRequestsDetailList, getPurchaseRequestsData, updatePurchaseRequest, deletePurchaseRequest, generatePRNumberForForm, getApprovedPurchaseRequests } from "../controllers/PurchaseRequestController.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get('/', verifyUser, getPurchaseRequestsList);
router.get('/list', verifyUser, getPurchaseRequestsList);
router.get('/detail-list', verifyUser, getPurchaseRequestsDetailList);
router.get('/approval-list', verifyUser, getApprovedPurchaseRequests);
router.get('/generate-number', verifyUser, generatePRNumberForForm);
router.get('/:id', verifyUser, getPurchaseRequestsData);
router.post('/', verifyUser, createPurchaseRequest);
router.post('/submit', verifyUser, submitPurchaseRequest);
router.post('/:id/approve', verifyUser, approvePurchaseRequest);
router.put('/:id', verifyUser, updatePurchaseRequest);
router.delete('/:id', verifyUser, deletePurchaseRequest);

export default (app) => {
  app.use('/api/purchase-request', router);
};