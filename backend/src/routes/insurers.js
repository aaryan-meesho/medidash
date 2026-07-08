import { Router } from 'express';
import { handleGetInsurers } from '../modules/hospitals/hospitals.controller.js';

export const insurersRouter = Router();

insurersRouter.get('/insurers', handleGetInsurers);
