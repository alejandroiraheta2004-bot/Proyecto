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

// Permitimos varios orígenes por defecto para evitar bloqueos CORS en dev
const allowedOrigins = (process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || 'http://localhost:5174,http://localhost:5175,http://localhost:5501,http://192.168.1.131:5175,http://192.168.1.131:5174,http://192.168.1.131:5501,https://paymentwallet.vercel.app')
	.split(',')
	.map((o) => o.trim());

app.use(cors({
	origin: (origin, callback) => {
		if (!origin) return callback(null, true); // Permite herramientas como curl/postman
		if (allowedOrigins.includes(origin)) return callback(null, true);
		if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
		if (/^http:\/\/192\.168\.1\.131:\d+$/.test(origin)) return callback(null, true);
		return callback(new Error('Not allowed by CORS'));
	},
	allowedHeaders: ['Content-Type', 'Authorization'],
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas versionadas de la API
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/rols/', rolRouter);
app.use('/api/v1/users/', userRouter);
app.use('/api/v1/transactions/', transactionRouter);
app.use('/api/v1/notifications/', notificationRouter);
app.use('/api/v1/audits/', auditRouter);
app.use('/api/v1/me', meRouter);
app.use('/api/v1/cards', cardRouter);
app.use('/api/v1/transfers', transferRouter);
app.use('/api/v1/recharges', rechargeRouter);
app.use('/api/v1/recharge', rechargeRouter);

export default app;
