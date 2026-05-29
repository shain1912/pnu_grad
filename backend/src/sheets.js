import { google } from 'googleapis';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { db } from './db.js';

const env = (k) => process.env[k] || '';

let _sheets = null;
let _initError = null;
let _headerWritten = false;
let _resolvedTab = null;  // 실제 시트 내 존재하는 탭 이름 (설정값과 다를 수 있음)

function getConfig() {
  return {
    sheetId: env('GOOGLE_SHEETS_ID'),
    keyPath: env('GOOGLE_SHEETS_SA_KEY_PATH'),
    tab: env('GOOGLE_SHEETS_TAB') || 'Responses',
  };
}

function isConfigured() {
  const { sheetId, keyPath } = getConfig();
  if (!sheetId || !keyPath) return false;
  const resolved = resolve(process.cwd(), keyPath);
  return existsSync(resolved);
}

export function getSheetStatus() {
  const { sheetId, keyPath, tab } = getConfig();
  if (!sheetId) return { configured: false, reason: 'GOOGLE_SHEETS_ID 없음' };
  if (!keyPath) return { configured: false, reason: 'GOOGLE_SHEETS_SA_KEY_PATH 없음' };
  const resolved = resolve(process.cwd(), keyPath);
  if (!existsSync(resolved)) return { configured: false, reason: `Service Account 키 파일 없음: ${resolved}` };
  if (_initError) return { configured: false, reason: `초기화 실패: ${_initError}` };
  return { configured: true, sheetId, tab };
}

async function getSheetsClient() {
  if (_sheets) return _sheets;
  if (_initError) throw new Error(_initError);
  const { keyPath } = getConfig();
  try {
    const credentials = JSON.parse(readFileSync(resolve(process.cwd(), keyPath), 'utf8'));
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      // Service Account 자신의 project를 quota project로 강제
      // (그렇지 않으면 SDK가 env의 GOOGLE_CLIENT_ID 프로젝트를 quota project로 잡는 경우 있음)
      projectId: credentials.project_id,
      clientOptions: { quotaProjectId: credentials.project_id },
    });
    _sheets = google.sheets({ version: 'v4', auth });
    return _sheets;
  } catch (err) {
    _initError = err.message;
    throw err;
  }
}

const HEADER_ROW = [
  'submitted_at', 'response_id', 'email', 'name',
  '학번', '학과', '이수학기', '희망 트랙', '진학희망 학과', '개인정보 동의',
];

async function resolveTabName(sheets, sheetId, configuredTab) {
  if (_resolvedTab) return _resolvedTab;
  const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId, fields: 'sheets.properties.title' });
  const titles = meta.data.sheets.map(s => s.properties.title);
  if (titles.includes(configuredTab)) {
    _resolvedTab = configuredTab;
  } else {
    // 첫 번째 탭 자동 사용 (Sheet1, 시트1 등)
    _resolvedTab = titles[0];
    console.log(`[sheets] 탭 "${configuredTab}" 없음 → 첫 번째 탭 "${_resolvedTab}" 사용`);
  }
  return _resolvedTab;
}

async function ensureHeader(sheets, sheetId, tab) {
  if (_headerWritten) return;
  const range = `${tab}!A1:J1`;
  const cur = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range }).catch(() => null);
  const isEmpty = !cur?.data?.values?.[0]?.length;
  if (isEmpty) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId, range, valueInputOption: 'RAW',
      requestBody: { values: [HEADER_ROW] },
    });
  }
  _headerWritten = true;
}

function buildRow(responseId) {
  // 응답 + 사용자 + 답변 텍스트화
  const r = db.prepare(`
    SELECT r.id, r.submitted_at, u.email, u.name
    FROM responses r JOIN users u ON u.id = r.user_id
    WHERE r.id = ?
  `).get(responseId);
  if (!r) throw new Error(`response ${responseId} not found`);

  const a = db.prepare(`
    SELECT a.question_id, a.selected_option_ids, a.text_value, qo.label AS option_label
    FROM answers a
    LEFT JOIN question_options qo
      ON qo.id = CAST(json_extract(a.selected_option_ids, '$[0]') AS INTEGER)
    WHERE a.response_id = ?
  `).all(responseId);

  const byQ = {};
  for (const row of a) byQ[row.question_id] = row;

  return [
    r.submitted_at,
    r.id,
    r.email,
    r.name,
    byQ[1]?.text_value || '',
    byQ[2]?.text_value || '',
    byQ[3]?.option_label || '',
    byQ[4]?.option_label || '',
    byQ[5]?.text_value || '',
    byQ[6]?.option_label || '',
  ];
}

export async function mirrorResponseToSheet(responseId) {
  if (!isConfigured()) {
    // 시트 미설정 — 조용히 스킵 (호출자는 sheet_synced_at을 채우지 않음)
    return { skipped: true, reason: 'not_configured' };
  }
  const { sheetId, tab: configuredTab } = getConfig();
  const sheets = await getSheetsClient();
  const tab = await resolveTabName(sheets, sheetId, configuredTab);
  await ensureHeader(sheets, sheetId, tab);

  const row = buildRow(responseId);
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${tab}!A1`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });

  db.prepare("UPDATE responses SET sheet_synced_at = datetime('now') WHERE id = ?").run(responseId);
  return { ok: true };
}
