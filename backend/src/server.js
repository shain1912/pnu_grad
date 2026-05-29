import './load-env.js'; // 반드시 최상단 — 다른 모듈이 process.env 읽기 전에

import express from 'express';
import cookieParser from 'cookie-parser';
import { initSchema } from './db.js';
import authRouter from './auth.js';
import surveysRouter from './surveys.js';
import adminRouter from './admin.js';

initSchema();

const app = express();
app.use(express.json({ limit: '512kb' }));
app.use(cookieParser());

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin === process.env.FRONTEND_URL) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

app.use('/auth', authRouter);
app.use('/api/surveys', surveysRouter);
app.use('/api/admin', adminRouter);
app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
  console.log(`OAuth: ${process.env.GOOGLE_CLIENT_ID ? 'enabled' : 'NOT configured'}`);
  console.log(`Allowed domain: ${process.env.ALLOWED_EMAIL_DOMAIN}`);
});
