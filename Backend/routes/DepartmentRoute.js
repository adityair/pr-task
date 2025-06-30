import express from "express";
import { createDepartment, getDepartments } from "../controllers/DepartmentController.js";
import { verifyUser, adminOnly } from "../middleware/AuthUser.js";

const router = express.Router();

// Endpoint: GET /api/departments
router.get('/', verifyUser, getDepartments);

// Endpoint: POST /api/departments
router.post('/',  verifyUser, adminOnly, createDepartment);

export default (app) => {
  app.use('/api/departments', router);
};
