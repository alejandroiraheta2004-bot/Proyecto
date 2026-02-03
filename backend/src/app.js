import express from 'express';
import cors from 'cors';
import rolRouter from './routes/rol.route.js';
import userRouter from './routes/user.route.js';
import transactionRouter from './routes/transaction.route.js';
import notificationRouter from './routes/notification.route.js';
import auditRouter from './routes/audit.route.js';
import authRouter from './routes/auth.route.js';
import meRouter from './routes/me.route.js';
import cardRouter from './routes/card.route.js';
import transferRouter from './routes/transfer.route.js';
import rechargeRouter from './routes/recharge.route.js';
import helmet from 'helmet';

const app = express();

// Middlewares de seguridad y parsing básico
app.use(helmet());

app.use(cors({
	origin: [
		'http://localhost:5174',
		'https://paymentwalletsv.vercel.app',
		'https://payment-wallet-w576.onrender.com'
	],
	credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas versionadas de la API
app.use('/api/v1/auth/', authRouter);
app.use('/api/v1/rols/', rolRouter);
app.use('/api/v1/users/', userRouter);
app.use('/api/v1/transactions/', transactionRouter);
app.use('/api/v1/notifications/', notificationRouter);
app.use('/api/v1/audits/', auditRouter);
app.use('/api/v1/me/', meRouter);
app.use('/api/v1/cards/', cardRouter);
app.use('/api/v1/transfers/', transferRouter);
app.use('/api/v1/recharges/', rechargeRouter);
app.use('/api/v1/recharge/', rechargeRouter);

export default app;
