import express from 'express';
import { getAllRols, getSingleRol, creatNewRol, updateNowRol, deleteNowRol } from '../controller/rol.controller.js';
import { upload } from '../middlewares/upload.middleware.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validateSchema } from '../middlewares/validator.schema.middleware.js';
import { createRolSchema } from '../schemas/rol.schema.js';

const rolRouter = express.Router();

// Endpoints para gestionar roles
rolRouter.get('/', getAllRols);
rolRouter.get('/:id', getSingleRol);
rolRouter.post('/', upload.none(),  validateSchema(createRolSchema), creatNewRol);
rolRouter.put('/:id', upload.none(), updateNowRol);
rolRouter.delete('/:id', deleteNowRol);

export default rolRouter;