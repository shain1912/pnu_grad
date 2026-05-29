import './load-env.js';
import bcrypt from 'bcryptjs';
import { db, initSchema } from './db.js';

initSchema();

// --- 1. 설문 시드 (신청 폼 = survey id 1) ---
const seedAdminUser = db.prepare(`
  INSERT OR IGNORE INTO users (google_sub, email, email_verified, name)
  VALUES (NULL, ?, 1, ?)
`);
seedAdminUser.run('admin@pusan.ac.kr', '연계과정 관리자');
const surveyAuthor = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@pusan.ac.kr');

const SURVEY_TITLE = '2026학년도 1학기 학·석사 연계과정 신청';
const existing = db.prepare('SELECT id FROM surveys WHERE title = ?').get(SURVEY_TITLE);
if (!existing) {
  const survey = db.prepare(`
    INSERT INTO surveys (title, description, author_id, is_public, closes_at)
    VALUES (?, ?, ?, 1, NULL)
  `).run(SURVEY_TITLE, '연계과정 사전 신청서. 접수 2026.1.7(수) ~ 1.14(수)', surveyAuthor.id);

  const surveyId = survey.lastInsertRowid;
  const insertQ = db.prepare(`INSERT INTO questions (survey_id, ord, type, body, is_required) VALUES (?, ?, ?, ?, ?)`);
  const insertOpt = db.prepare(`INSERT INTO question_options (question_id, ord, label) VALUES (?, ?, ?)`);

  insertQ.run(surveyId, 1, 'short_text', '학번', 1);
  insertQ.run(surveyId, 2, 'short_text', '소속 학과(부)', 1);

  const q3 = insertQ.run(surveyId, 3, 'single', '현재 이수 학기', 1).lastInsertRowid;
  ['4학기','5학기','6학기','7학기'].forEach((l,i)=>insertOpt.run(q3, i+1, l));

  const q4 = insertQ.run(surveyId, 4, 'single', '희망 트랙', 1).lastInsertRowid;
  ['① 학·석사 연계과정','② 학·석박사통합 연계과정','③ 연계과정 전환'].forEach((l,i)=>insertOpt.run(q4, i+1, l));

  insertQ.run(surveyId, 5, 'short_text', '진학희망 대학원 학과 (선택)', 0);

  const q6 = insertQ.run(surveyId, 6, 'single', '개인정보 수집·이용 동의', 1).lastInsertRowid;
  insertOpt.run(q6, 1, '동의');

  console.log(`Seeded survey "${SURVEY_TITLE}" id=${surveyId}`);
}

// --- 2. Admin 부트스트랩 ---
const bootUser = process.env.ADMIN_BOOTSTRAP_USERNAME;
const bootPw = process.env.ADMIN_BOOTSTRAP_PASSWORD;
if (bootUser && bootPw) {
  const exists = db.prepare('SELECT id FROM admins WHERE username = ?').get(bootUser);
  if (!exists) {
    const hash = bcrypt.hashSync(bootPw, 10);
    db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(bootUser, hash);
    console.log(`Seeded admin "${bootUser}". ⚠ .env의 ADMIN_BOOTSTRAP_PASSWORD를 제거하세요.`);
  } else {
    console.log(`Admin "${bootUser}" already exists, skipping bootstrap.`);
  }
} else {
  console.log('No ADMIN_BOOTSTRAP_USERNAME/PASSWORD in env, skipping admin seed.');
}

console.log('DB initialized at backend/data.sqlite');
