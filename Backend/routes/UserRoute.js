import express from "express";
import {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} from "../controllers/Users.js";
import { verifyUser, adminOnly } from "../middleware/AuthUser.js";

const router = express.Router();

router.get('/', verifyUser, getUsers);
router.get('/:uuid', verifyUser, getUserById);
router.post('/',  verifyUser, adminOnly, createUser);
router.patch('/:uuid', verifyUser, adminOnly, updateUser);
router.delete('/:uuid', verifyUser, adminOnly, deleteUser);

export default (app) => {
  app.use('/api/users', router);
};