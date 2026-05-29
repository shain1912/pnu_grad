import './load-env.js'; // 반드시 최상단 — 다른 모듈이 process.env 읽기 전에

import express from 'express';
import cookieParser from 'cookie-parser';
import { networkInterfaces } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { initSchema } from './db.js';
import authRouter from './auth.js';
import surveysRouter from './surveys.js';
import adminRouter from './admin.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

initSchema();

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const isDev = !isProd;

// HTTPS proxy(Cloudflare Tunnel / nginx) 뒤에 있을 때 X-Forwarded-Proto 신뢰
app.set('trust proxy', 1);

app.use(express.json({ limit: '512kb' }));
app.use(cookieParser());

// === CORS ===
const PRIVATE_IP_RE = /^https?:\/\/(localhost|127\.0\.0\.1|10\.[\d.]+|192\.168\.[\d.]+|172\.(1[6-9]|2[0-9]|3[01])\.[\d.]+)(:\d+)?$/;

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (origin === process.env.FRONTEND_URL) return true;
  const extras = (process.env.FRONTEND_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (extras.includes(origin)) return true;
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

// === API Routes ===
app.use('/auth', authRouter);
app.use('/api/surveys', surveysRouter);
app.use('/api/admin', adminRouter);
app.get('/health', (req, res) => res.json({ ok: true }));

// === Production: 프론트 정적 서빙 + SPA fallback ===
// (dev 모드에서는 Vite dev 서버가 따로 5173에서 서빙하므로 스킵)
const distPath = resolve(__dirname, '..', '..', 'frontend', 'dist');
if (isProd && existsSync(distPath)) {
  app.use(express.static(distPath, { index: false, extensions: ['html'] }));
  // SPA fallback — /admin/login, /login 등 React 라우트
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/auth') || req.path.startsWith('/api') || req.path === '/health') return next();
    res.sendFile(join(distPath, 'index.html'));
  });
  console.log(`[prod] Static serving: ${distPath}`);
} else if (isProd) {
  console.warn(`[prod] dist/ 없음 — frontend 빌드 안 됨. 'cd frontend && npm run build' 실행하세요.`);
}

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
  console.log(`Backend listening on http://localhost:${PORT} (${isProd ? 'production' : 'development'})`);
  if (isDev) {
    for (const ip of getLanAddresses()) {
      console.log(`               also  http://${ip}:${PORT}  (LAN)`);
    }
  }
  console.log(`OAuth: ${process.env.GOOGLE_CLIENT_ID ? 'enabled' : 'NOT configured'}`);
  console.log(`Allowed domain: ${process.env.ALLOWED_EMAIL_DOMAIN}`);
  console.log(`CORS allowed: ${process.env.FRONTEND_URL}${isDev ? ' + LAN private-IP origins (dev)' : ''}`);
});
