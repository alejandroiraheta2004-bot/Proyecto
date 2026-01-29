import express from 'express';
import { getTransactions, getTransaction, createTransaction, updateTransaction, deleteTransaction } from '../controller/transaction.controller.js';
import { upload } from '../middlewares/upload.middleware.js';
import { verifyToken, requireActiveUser } from '../middlewares/auth.middleware.js';

const transactionRouter = express.Router();

// CRUD de transacciones protegido por autenticación y estado activo
transactionRouter.get('/', verifyToken, getTransactions);
transactionRouter.get('/:id', verifyToken, getTransaction);
transactionRouter.post('/', upload.none(), verifyToken, requireActiveUser, createTransaction);
transactionRouter.put("/:id", upload.none(), verifyToken, requireActiveUser, updateTransaction);
transactionRouter.delete("/:id", verifyToken, requireActiveUser, deleteTransaction);

export default transactionRouter;