import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import consultasRouter from './routes/consultas.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: true, credentials: false }));

// Auth simples por header x-api-token
app.use((req, res, next) => {
  const token = req.headers['x-api-token'];
  if (process.env.API_TOKEN && token !== process.env.API_TOKEN) {
    return res.status(401).json({ message: 'unauthorized' });
  }
  next();
});

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/consultas', consultasRouter);

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`API SQLServer rodando na porta ${port}`);
});


