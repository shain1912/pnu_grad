import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', 'data.sqlite');

export const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      google_sub TEXT UNIQUE,
      email TEXT NOT NULL UNIQUE,
      email_verified INTEGER DEFAULT 0,
      name TEXT,
      picture TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      last_login_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS surveys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      author_id INTEGER NOT NULL REFERENCES users(id),
      is_public INTEGER DEFAULT 1,
      closes_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
      ord INTEGER NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('single','multi','scale5','short_text','long_text')),
      body TEXT NOT NULL,
      is_required INTEGER DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_questions_survey_ord ON questions(survey_id, ord);

    CREATE TABLE IF NOT EXISTS question_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
      ord INTEGER NOT NULL,
      label TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id),
      submitted_at TEXT DEFAULT (datetime('now')),
      sheet_synced_at TEXT,  -- NULL = 시트 미러 미동기. 채워지면 시트에 append됨.
      UNIQUE (survey_id, user_id)
    );
    CREATE INDEX IF NOT EXISTS idx_responses_survey ON responses(survey_id);

    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      last_login_at TEXT
    );

    CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      response_id INTEGER NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
      question_id INTEGER NOT NULL REFERENCES questions(id),
      selected_option_ids TEXT,  -- JSON array, e.g. "[12]" or "[12,15]"
      numeric_value INTEGER CHECK (numeric_value IS NULL OR (numeric_value BETWEEN 1 AND 5)),
      text_value TEXT,
      UNIQUE (response_id, question_id)
    );
    CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
  `);

  // 기존 DB 마이그레이션: responses에 sheet_synced_at 컬럼이 없으면 추가
  const cols = db.prepare("PRAGMA table_info(responses)").all();
  if (!cols.some(c => c.name === 'sheet_synced_at')) {
    db.exec("ALTER TABLE responses ADD COLUMN sheet_synced_at TEXT");
    console.log('[migrate] added responses.sheet_synced_at');
  }
  db.exec("CREATE INDEX IF NOT EXISTS idx_responses_sync ON responses(sheet_synced_at)");
}
