import express from 'express';
import { recharge } from '../controller/recharge.controller.js';
import { verifyToken, requireActiveUser } from '../middlewares/auth.middleware.js';
import { validateSchema } from '../middlewares/validator.schema.middleware.js';
import { rechargeSchema } from '../schemas/recharge.schema.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.post('/', verifyToken, requireActiveUser, validateSchema(rechargeSchema), recharge);

export default router;
