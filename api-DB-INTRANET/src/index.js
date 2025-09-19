import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import consultasRouter from './routes/consultas.js';
import usersRouter from './routes/users.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: true, credentials: false }));

// Auth simples por header x-api-token, mas ignorar para rota /api/users/login e POST /api/users
app.use((req, res, next) => {
  if (req.path === '/api/users/login' || req.path.startsWith('/api/users/login') || (req.path === '/api/users' && req.method === 'POST')) {
    return next();
  }
  const token = req.headers['x-api-token'];
  if (process.env.API_TOKEN && token !== process.env.API_TOKEN) {
    return res.status(401).json({ message: 'unauthorized' });
  }
  next();
});

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/consultas', consultasRouter);
app.use('/api/users', usersRouter);

const port = process.env.PORT || 5002; // Porta diferente, 5002
// Allow binding to a specific host (useful when running on a remote server)
const host = process.env.HOST || '0.0.0.0';
app.listen(port, host, () => {
  console.log(`API NovoBanco rodando em http://${host}:${port}`);
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err && err.stack ? err.stack : err);
  res.status(500).json({ message: 'Ocorreu um erro interno no servidor.', error: err?.message || String(err) });
});
