import express from 'express';
import {
  listPayments,
  getPayment,
  createPayment,
  updatePayment,
  cancelPayment,
  listExecutions,
  getExecution,
  runDuePayments
} from '../controller/payment.controller.js';
import { verifyToken, requireActiveUser } from '../middlewares/auth.middleware.js';
import { validateSchema } from '../middlewares/validator.schema.middleware.js';
import { createPaymentSchema, updatePaymentSchema } from '../schemas/payment.schema.js';

const router = express.Router();

router.get('/', verifyToken, listPayments);
router.get('/executions', verifyToken, listExecutions);
router.get('/executions/:id', verifyToken, getExecution);
router.get('/:id', verifyToken, getPayment);

router.post('/', verifyToken, requireActiveUser, validateSchema(createPaymentSchema), createPayment);
router.patch('/:id', verifyToken, requireActiveUser, validateSchema(updatePaymentSchema), updatePayment);
router.patch('/:id/cancel', verifyToken, requireActiveUser, cancelPayment);
router.post('/run-due', verifyToken, requireActiveUser, runDuePayments);

export default router;
