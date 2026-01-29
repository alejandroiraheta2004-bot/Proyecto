import express from 'express';
import { sendInternal, sendExternal } from '../controller/transfer.controller.js';
import { verifyToken, requireActiveUser } from '../middlewares/auth.middleware.js';
import { validateSchema } from '../middlewares/validator.schema.middleware.js';
import { sendInternalSchema, sendExternalSchema } from '../schemas/transfer.schema.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.post('/internal', upload.none(), verifyToken, requireActiveUser, validateSchema(sendInternalSchema), sendInternal);
router.post('/external', upload.none(), verifyToken, requireActiveUser, validateSchema(sendExternalSchema), sendExternal);

export default router;
