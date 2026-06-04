import './load-env.js';
import bcrypt from 'bcryptjs';
import { db, pool, tx, initSchema } from './db.js';

await initSchema();

// --- 1. 설문 시드 (신청 폼 = survey id 1) ---
await db.prepare(`
  INSERT INTO users (google_sub, email, email_verified, name)
  VALUES (NULL, ?, 1, ?)
  ON CONFLICT (email) DO NOTHING
`).run('admin@pusan.ac.kr', '연계과정 관리자');
const surveyAuthor = await db.prepare('SELECT id FROM users WHERE email = ?').get('admin@pusan.ac.kr');

// ADR 0005 — 응답 데이터 최소화 + 트랙 + 3지망(학과/전공) 모델.
// 동일 타이틀 survey가 있으면 종속 데이터까지 삭제 후 재시드(개발용).
const SURVEY_TITLE = '2026학년도 1학기 학·석사 연계과정 신청';

await tx(async (t) => {
  const existing = await t.get('SELECT id FROM surveys WHERE title = ?', SURVEY_TITLE);
  if (existing) {
    const sid = existing.id;
    // responses → answers (FK 순서 무관하게 명시적으로 모두 삭제)
    await t.run('DELETE FROM answers WHERE response_id IN (SELECT id FROM responses WHERE survey_id = ?)', sid);
    await t.run('DELETE FROM responses WHERE survey_id = ?', sid);
    await t.run('DELETE FROM question_options WHERE question_id IN (SELECT id FROM questions WHERE survey_id = ?)', sid);
    await t.run('DELETE FROM questions WHERE survey_id = ?', sid);
    await t.run('DELETE FROM surveys WHERE id = ?', sid);
    console.log(`Removed existing survey "${SURVEY_TITLE}" (id=${sid}) and its dependent data for reseed.`);
  }

  // 프론트가 /api/surveys/1 을 하드코딩하므로 survey id를 1로 고정
  await t.run(`
    INSERT INTO surveys (id, title, description, author_id, is_public, closes_at)
    VALUES (1, ?, ?, ?, 1, NULL)
  `, SURVEY_TITLE, '연계과정 사전 신청서 — 희망 트랙 + 진학 희망 학과 3지망.', surveyAuthor.id);

  const surveyId = 1;

  // Q1 — 희망 트랙 (single, 필수)
  const q1 = (await t.run(
    `INSERT INTO questions (survey_id, ord, type, body, is_required) VALUES (?, ?, ?, ?, ?) RETURNING id`,
    surveyId, 1, 'single', '희망 트랙', 1
  )).rows[0].id;
  const trackOpts = ['① 학·석사 연계과정', '② 학·석박사통합 연계과정', '③ 연계과정 전환'];
  for (let i = 0; i < trackOpts.length; i++) {
    await t.run('INSERT INTO question_options (question_id, ord, label) VALUES (?, ?, ?)', q1, i + 1, trackOpts[i]);
  }

  // Q2~Q4 — 1/2/3지망 (short_text). 형식 "학과명 / 전공명" (전공 없으면 "학과명")
  await t.run('INSERT INTO questions (survey_id, ord, type, body, is_required) VALUES (?, ?, ?, ?, ?)', surveyId, 2, 'short_text', '1지망 (학과/전공)', 1);
  await t.run('INSERT INTO questions (survey_id, ord, type, body, is_required) VALUES (?, ?, ?, ?, ?)', surveyId, 3, 'short_text', '2지망 (학과/전공)', 0);
  await t.run('INSERT INTO questions (survey_id, ord, type, body, is_required) VALUES (?, ?, ?, ?, ?)', surveyId, 4, 'short_text', '3지망 (학과/전공)', 0);

  console.log(`Seeded survey "${SURVEY_TITLE}" id=${surveyId} (track + 3 preferences)`);
});

// --- 2. Admin 부트스트랩 ---
const bootUser = process.env.ADMIN_BOOTSTRAP_USERNAME;
const bootPw = process.env.ADMIN_BOOTSTRAP_PASSWORD;
if (bootUser && bootPw) {
  const exists = await db.prepare('SELECT id FROM admins WHERE username = ?').get(bootUser);
  if (!exists) {
    const hash = bcrypt.hashSync(bootPw, 10);
    await db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(bootUser, hash);
    console.log(`Seeded admin "${bootUser}". ⚠ .env의 ADMIN_BOOTSTRAP_PASSWORD를 제거하세요.`);
  } else {
    console.log(`Admin "${bootUser}" already exists, skipping bootstrap.`);
  }
} else {
  console.log('No ADMIN_BOOTSTRAP_USERNAME/PASSWORD in env, skipping admin seed.');
}

console.log('DB initialized (PostgreSQL).');
await pool.end();
