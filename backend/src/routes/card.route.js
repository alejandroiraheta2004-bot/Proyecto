import express from 'express';
import { getMyCards, createMyCard, updateMyCardStatus, deleteMyCard } from '../controller/card.controller.js';
import { verifyToken, requireActiveUser } from '../middlewares/auth.middleware.js';
import { validateSchema } from '../middlewares/validator.schema.middleware.js';
import { createCardSchema, updateCardStatusSchema } from '../schemas/card.schema.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.get('/', verifyToken, getMyCards);
router.post('/', verifyToken, requireActiveUser, validateSchema(createCardSchema), createMyCard);
router.patch('/:id/status', verifyToken, requireActiveUser, validateSchema(updateCardStatusSchema), updateMyCardStatus);
router.delete('/:id', verifyToken, requireActiveUser, deleteMyCard);

export default router;
