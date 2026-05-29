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

export function requireAdmin(req, res, next) {
  const token = req.cookies?.admin_token;
  if (!token) return res.status(401).json({ error: 'unauthenticated' });
  try {
    const payload = jwt.verify(token, JWT_SECRET(), { audience: ADMIN_AUDIENCE });
    const admin = db.prepare('SELECT id, username FROM admins WHERE id = ?').get(payload.sub);
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

  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  if (!admin) return res.status(401).json({ error: 'invalid_credentials' });

  const ok = await bcrypt.compare(password, admin.password_hash);
  if (!ok) return res.status(401).json({ error: 'invalid_credentials' });

  db.prepare("UPDATE admins SET last_login_at = datetime('now') WHERE id = ?").run(admin.id);
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
router.get('/stats', requireAdmin, (req, res) => {
  const surveyId = 1; // 단일 신청 설문 가정 (MVP)

  const totalRow = db.prepare('SELECT COUNT(*) AS c FROM responses WHERE survey_id = ?').get(surveyId);
  const total = totalRow.c;

  const last24hRow = db.prepare(
    "SELECT COUNT(*) AS c FROM responses WHERE survey_id = ? AND submitted_at >= datetime('now','-1 day')"
  ).get(surveyId);

  const notSyncedRow = db.prepare(
    'SELECT COUNT(*) AS c FROM responses WHERE survey_id = ? AND sheet_synced_at IS NULL'
  ).get(surveyId);

  // 트랙별 분포 (Q4 = question_id 4, options 5/6/7)
  const trackRows = db.prepare(`
    SELECT qo.label, COUNT(*) AS c
    FROM answers a JOIN responses r ON r.id = a.response_id
    JOIN question_options qo ON qo.id = CAST(json_extract(a.selected_option_ids, '$[0]') AS INTEGER)
    WHERE a.question_id = 4 AND r.survey_id = ?
    GROUP BY qo.label
    ORDER BY qo.ord
  `).all(surveyId);

  // 이수학기 분포 (Q3, options 1/2/3/4)
  const semRows = db.prepare(`
    SELECT qo.label, COUNT(*) AS c
    FROM answers a JOIN responses r ON r.id = a.response_id
    JOIN question_options qo ON qo.id = CAST(json_extract(a.selected_option_ids, '$[0]') AS INTEGER)
    WHERE a.question_id = 3 AND r.survey_id = ?
    GROUP BY qo.label
    ORDER BY qo.ord
  `).all(surveyId);

  // 학과 top 5 (Q2, short_text)
  const deptRows = db.prepare(`
    SELECT TRIM(a.text_value) AS dept, COUNT(*) AS c
    FROM answers a JOIN responses r ON r.id = a.response_id
    WHERE a.question_id = 2 AND r.survey_id = ?
      AND TRIM(COALESCE(a.text_value,'')) <> ''
    GROUP BY dept ORDER BY c DESC, dept LIMIT 5
  `).all(surveyId);

  res.json({
    total_responses: total,
    last_24h: last24hRow.c,
    not_synced: notSyncedRow.c,
    track_distribution: trackRows.map(r => ({ label: r.label, count: r.c })),
    semester_distribution: semRows.map(r => ({ label: r.label, count: r.c })),
    top_departments: deptRows.map(r => ({ label: r.dept, count: r.c })),
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
  const rows = db.prepare(
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
router.get('/responses.csv', requireAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT r.id, r.submitted_at, u.email, u.name,
           (SELECT a.text_value FROM answers a WHERE a.response_id = r.id AND a.question_id = 1) AS 학번,
           (SELECT a.text_value FROM answers a WHERE a.response_id = r.id AND a.question_id = 2) AS 학과,
           (SELECT qo.label FROM answers a JOIN question_options qo
              ON qo.id = CAST(json_extract(a.selected_option_ids,'$[0]') AS INTEGER)
              WHERE a.response_id = r.id AND a.question_id = 3) AS 이수학기,
           (SELECT qo.label FROM answers a JOIN question_options qo
              ON qo.id = CAST(json_extract(a.selected_option_ids,'$[0]') AS INTEGER)
              WHERE a.response_id = r.id AND a.question_id = 4) AS 트랙,
           (SELECT a.text_value FROM answers a WHERE a.response_id = r.id AND a.question_id = 5) AS 진학희망학과,
           (SELECT qo.label FROM answers a JOIN question_options qo
              ON qo.id = CAST(json_extract(a.selected_option_ids,'$[0]') AS INTEGER)
              WHERE a.response_id = r.id AND a.question_id = 6) AS 동의
    FROM responses r JOIN users u ON u.id = r.user_id
    WHERE r.survey_id = 1
    ORDER BY r.submitted_at
  `).all();

  const headers = ['response_id','submitted_at','email','name','학번','학과','이수학기','트랙','진학희망학과','동의'];
  const esc = v => {
    if (v == null) return '';
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
  };
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push([r.id, r.submitted_at, r.email, r.name, r.학번, r.학과, r.이수학기, r.트랙, r.진학희망학과, r.동의].map(esc).join(','));
  }
  // UTF-8 BOM (엑셀에서 한글 깨짐 방지)
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="responses-${new Date().toISOString().slice(0,10)}.csv"`);
  res.send('﻿' + lines.join('\n'));
});

export default router;
