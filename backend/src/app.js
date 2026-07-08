import express from 'express';
import cors from 'cors';
import './db/index.js';
import { hospitalsRouter } from './routes/hospitals.js';
import { insurersRouter } from './routes/insurers.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', hospitalsRouter);
app.use('/api', insurersRouter);
