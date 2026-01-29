import express from 'express';
import { getNotifications, getNotification, createNotification, updateNotification, deleteNofication } 
from '../controller/notification.controller.js';
import { upload } from '../middlewares/upload.middleware.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const notificationRouter = express.Router();

// Rutas de notificaciones (sin autenticación estricta en este mock)
notificationRouter.get('/', getNotifications);
notificationRouter.get('/:id', getNotification);
notificationRouter.post('/', upload.none(), createNotification);
notificationRouter.put('/:id', upload.none(), updateNotification);
notificationRouter.delete('/:id', deleteNofication);

export default notificationRouter;