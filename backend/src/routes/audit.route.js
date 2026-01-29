import express from 'express';
import { createAudit, getAudit, getAudits, updateAudit, deleteAudit } from '../controller/audit.controller.js';
import { upload } from '../middlewares/upload.middleware.js';
import { verifyToken } from '../middlewares/auth.middleware.js';


const auditRouter = express.Router();

// Rutas CRUD de auditorías
auditRouter.get('/', getAudits);
auditRouter.get('/:id', getAudit);
auditRouter.post('/', upload.none(), createAudit);
auditRouter.put('/:id', upload.none(), updateAudit);
auditRouter.delete('/:id', deleteAudit);

export default auditRouter;