import './load-env.js'; // 반드시 최상단 — 다른 모듈이 process.env 읽기 전에

import express from 'express';
import cookieParser from 'cookie-parser';
import { networkInterfaces } from 'node:os';
import { initSchema } from './db.js';
import authRouter from './auth.js';
import surveysRouter from './surveys.js';
import adminRouter from './admin.js';

initSchema();

const app = express();
app.use(express.json({ limit: '512kb' }));
app.use(cookieParser());

// === CORS ===
// FRONTEND_URL 정확 매칭 + (dev 모드면) LAN 사설 IP origin 자동 허용
const PRIVATE_IP_RE = /^https?:\/\/(localhost|127\.0\.0\.1|10\.[\d.]+|192\.168\.[\d.]+|172\.(1[6-9]|2[0-9]|3[01])\.[\d.]+)(:\d+)?$/;
const isDev = (process.env.NODE_ENV || 'development') !== 'production';

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (origin === process.env.FRONTEND_URL) return true;
  // 쉼표 구분 다중 origin 화이트리스트
  const extras = (process.env.FRONTEND_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (extras.includes(origin)) return true;
  // dev에서는 LAN 사설 IP 자동 허용
  if (isDev && PRIVATE_IP_RE.test(origin)) return true;
  return false;
}

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (isAllowedOrigin(origin)) {
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

function getLanAddresses() {
  const nets = networkInterfaces();
  const addrs = [];
  for (const list of Object.values(nets)) {
    for (const n of list || []) {
      if (n.family === 'IPv4' && !n.internal) addrs.push(n.address);
    }
  }
  return addrs;
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
  for (const ip of getLanAddresses()) {
    console.log(`               also  http://${ip}:${PORT}  (LAN)`);
  }
  console.log(`OAuth: ${process.env.GOOGLE_CLIENT_ID ? 'enabled' : 'NOT configured'}`);
  console.log(`Allowed domain: ${process.env.ALLOWED_EMAIL_DOMAIN}`);
  console.log(`CORS allowed: ${process.env.FRONTEND_URL}${isDev ? ' + LAN private-IP origins (dev)' : ''}`);
});
