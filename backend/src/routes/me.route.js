import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { me, myTransactions, createMyTransaction, updatePrimaryCard } from '../controller/me.controller.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

// Rutas para el usuario autenticado (perfil y sus transacciones)
router.get('/', verifyToken, me);
router.get('/transactions', verifyToken, myTransactions);
router.post('/transactions', upload.none(), verifyToken, createMyTransaction);
router.patch('/primary-card', verifyToken, updatePrimaryCard);

export default router;
