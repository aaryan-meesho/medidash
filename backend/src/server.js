import express from 'express';
import cors from 'cors';
import './db/index.js';
import { hospitalsRouter } from './routes/hospitals.js';
import { insurersRouter } from './routes/insurers.js';

const app = express();
const PORT = process.env.PORT || 8090;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', hospitalsRouter);
app.use('/api', insurersRouter);

app.listen(PORT, () => {
  console.log(`MediDash backend listening on port ${PORT}`);
});
