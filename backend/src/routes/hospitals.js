import { Router } from 'express';
import { handleGetHospitals } from '../modules/hospitals/hospitals.controller.js';

export const hospitalsRouter = Router();

hospitalsRouter.get('/hospitals', handleGetHospitals);
