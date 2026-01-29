import express from 'express';
import { getAllUsers, getSingleUser, createNewUser, updateUser, deleteUser, updateUserStatus} from '../controller/user.controller.js';
import { upload } from '../middlewares/upload.middleware.js';
import {  createUserSchema, validateUserInfoSchema } from '../schemas/user.schema.js';
import { validateSchema } from '../middlewares/validator.schema.middleware.js';
import { verifyToken, requireAdmin } from '../middlewares/auth.middleware.js';
import { readUsersPermissionAccess } from '../middlewares/access.control.middleware.js';

const userRouter = express.Router();

// Administración de usuarios
userRouter.get('/', upload.none(), verifyToken, requireAdmin, getAllUsers);
userRouter.get('/:id', upload.none(), verifyToken, requireAdmin, getSingleUser);
userRouter.post('/', upload.none(), validateSchema(createUserSchema), createNewUser);
userRouter.put('/:id', upload.none(), verifyToken, requireAdmin, updateUser);
userRouter.patch('/:id/estado', upload.none(), verifyToken, requireAdmin, updateUserStatus);
userRouter.delete(":id", verifyToken, requireAdmin, deleteUser);

export default userRouter;