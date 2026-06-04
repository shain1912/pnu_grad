import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import { mirrorResponseToSheet, getSheetStatus } from './sheets.js';

const router = express.Router();

const env = (k, fallback) => process.env[k] ?? fallback;
const JWT_SECRET = () => env('JWT_SECRET');
const ADMIN_JWT_EXPIRES_IN = () => env('ADMIN_JWT_EXPIRES_IN', '2h');
const NODE_ENV = () => env('NODE_ENV', 'development');

const ADMIN_AUDIENCE = 'admin';

function issueAdminJwt(admin) {
  return jwt.sign(
    { sub: admin.id, username: admin.username, aud: ADMIN_AUDIENCE },
    JWT_SECRET(),
    { expiresIn: ADMIN_JWT_EXPIRES_IN() }
  );
}

function setAdminCookie(res, token) {
  res.cookie('admin_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: NODE_ENV() === 'production',
    maxAge: 2 * 60 * 60 * 1000,
  });
}

export async function requireAdmin(req, res, next) {
  const token = req.cookies?.admin_token;
  if (!token) return res.status(401).json({ error: 'unauthenticated' });
  try {
    const payload = jwt.verify(token, JWT_SECRET(), { audience: ADMIN_AUDIENCE });
    const admin = await db.prepare('SELECT id, username FROM admins WHERE id = ?').get(payload.sub);
    if (!admin) return res.status(401).json({ error: 'admin_not_found' });
    req.admin = admin;
    next();
  } catch {
    return res.status(401).json({ error: 'invalid_token' });
  }
}

// === Routes ===

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'missing_credentials' });

  const admin = await db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  if (!admin) return res.status(401).json({ error: 'invalid_credentials' });

  const ok = await bcrypt.compare(password, admin.password_hash);
  if (!ok) return res.status(401).json({ error: 'invalid_credentials' });

  await db.prepare('UPDATE admins SET last_login_at = now() WHERE id = ?').run(admin.id);
  setAdminCookie(res, issueAdminJwt(admin));
  res.json({ admin: { id: admin.id, username: admin.username } });
});

router.post('/logout', (req, res) => {
  res.clearCookie('admin_token');
  res.status(204).end();
});

router.get('/me', requireAdmin, (req, res) => {
  res.json({ admin: req.admin });
});

// === Dashboard 통계 ===
router.get('/stats', requireAdmin, async (req, res) => {
  const surveyId = 1; // 단일 신청 설문 가정 (MVP)

  const total = (await db.prepare('SELECT COUNT(*)::int AS c FROM responses WHERE survey_id = ?').get(surveyId)).c;

  const last24hRow = await db.prepare(
    "SELECT COUNT(*)::int AS c FROM responses WHERE survey_id = ? AND submitted_at >= now() - interval '1 day'"
  ).get(surveyId);

  const notSyncedRow = await db.prepare(
    'SELECT COUNT(*)::int AS c FROM responses WHERE survey_id = ? AND sheet_synced_at IS NULL'
  ).get(surveyId);

  // 동적 question_id 매핑 (ADR 0005: ord 1=트랙(single), 2~4=1/2/3지망(short_text))
  const qs = await db.prepare(
    'SELECT id, ord, type FROM questions WHERE survey_id = ? ORDER BY ord'
  ).all(surveyId);
  const trackQ = qs.find(q => q.ord === 1 && q.type === 'single');
  const prefQIds = qs.filter(q => q.ord >= 2 && q.ord <= 4 && q.type === 'short_text').map(q => q.id);

  // 트랙별 분포 (Q1, single)
  const trackRows = trackQ ? await db.prepare(`
    SELECT qo.label, COUNT(*)::int AS c
    FROM answers a JOIN responses r ON r.id = a.response_id
    JOIN question_options qo ON qo.id = (a.selected_option_ids::jsonb ->> 0)::int
    WHERE a.question_id = ? AND r.survey_id = ?
    GROUP BY qo.label, qo.ord
    ORDER BY qo.ord
  `).all(trackQ.id, surveyId) : [];

  // 지망 학과/전공 top 10 (1/2/3지망 short_text 통합 집계)
  let prefRows = [];
  if (prefQIds.length) {
    const placeholders = prefQIds.map(() => '?').join(',');
    prefRows = await db.prepare(`
      SELECT TRIM(a.text_value) AS pref, COUNT(*)::int AS c
      FROM answers a JOIN responses r ON r.id = a.response_id
      WHERE a.question_id IN (${placeholders}) AND r.survey_id = ?
        AND TRIM(COALESCE(a.text_value,'')) <> ''
      GROUP BY pref ORDER BY c DESC, pref LIMIT 10
    `).all(...prefQIds, surveyId);
  }

  res.json({
    total_responses: total,
    last_24h: last24hRow.c,
    not_synced: notSyncedRow.c,
    track_distribution: trackRows.map(r => ({ label: r.label, count: r.c })),
    top_preferences: prefRows.map(r => ({ label: r.pref, count: r.c })),
    sheet: getSheetStatus(),
    generated_at: new Date().toISOString(),
  });
});

// === 누락분 재동기화 ===
router.post('/sync', requireAdmin, async (req, res) => {
  const status = getSheetStatus();
  if (!status.configured) {
    return res.status(400).json({ error: 'sheet_not_configured' });
  }
  const rows = await db.prepare(
    'SELECT id FROM responses WHERE sheet_synced_at IS NULL ORDER BY id'
  ).all();

  let synced = 0;
  let failed = 0;
  for (const r of rows) {
    try {
      await mirrorResponseToSheet(r.id);
      synced++;
    } catch (err) {
      console.error(`[sync] response ${r.id} failed:`, err.message);
      failed++;
    }
  }
  res.json({ attempted: rows.length, synced, failed });
});

// === CSV 다운로드 ===
router.get('/responses.csv', requireAdmin, async (req, res) => {
  // ADR 0005 — email·트랙·1/2/3지망만 내보냄 (이름/학번/학과/이수학기 제거).
  // ord 1=트랙(single), 2~4=1/2/3지망(short_text)
  const qs = await db.prepare(
    'SELECT id, ord, type FROM questions WHERE survey_id = 1 ORDER BY ord'
  ).all();
  const trackQ = qs.find(q => q.ord === 1 && q.type === 'single');
  const pref1 = qs.find(q => q.ord === 2);
  const pref2 = qs.find(q => q.ord === 3);
  const pref3 = qs.find(q => q.ord === 4);

  const rows = await db.prepare(`
    SELECT r.id, r.submitted_at, u.email,
           (SELECT qo.label FROM answers a JOIN question_options qo
              ON qo.id = (a.selected_option_ids::jsonb ->> 0)::int
              WHERE a.response_id = r.id AND a.question_id = ?) AS 트랙,
           (SELECT a.text_value FROM answers a WHERE a.response_id = r.id AND a.question_id = ?) AS 지망1,
           (SELECT a.text_value FROM answers a WHERE a.response_id = r.id AND a.question_id = ?) AS 지망2,
           (SELECT a.text_value FROM answers a WHERE a.response_id = r.id AND a.question_id = ?) AS 지망3
    FROM responses r JOIN users u ON u.id = r.user_id
    WHERE r.survey_id = 1
    ORDER BY r.submitted_at
  `).all(trackQ?.id ?? -1, pref1?.id ?? -1, pref2?.id ?? -1, pref3?.id ?? -1);

  const headers = ['response_id','submitted_at','email','트랙','1지망','2지망','3지망'];
  const esc = v => {
    if (v == null) return '';
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
  };
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push([r.id, r.submitted_at, r.email, r.트랙, r.지망1, r.지망2, r.지망3].map(esc).join(','));
  }
  // UTF-8 BOM (엑셀에서 한글 깨짐 방지)
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="responses-${new Date().toISOString().slice(0,10)}.csv"`);
  res.send('﻿' + lines.join('\n'));
});

export default router;
