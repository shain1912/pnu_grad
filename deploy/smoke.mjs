// 마이그레이션 E2E 스모크 — 컨테이너 안(/app/backend)에서 실행.
// 읽기/쓰기/트랜잭션/중복(23505)/JSON 저장·복원/통계(json_extract 캐스팅)/CSV 전 경로 검증.
import jwt from 'jsonwebtoken';

const B = 'http://localhost:3001';
const SEC = 'testsecret';
const uH = { Cookie: 'token=' + jwt.sign({ sub: 1, email: 'admin@pusan.ac.kr', name: 'x' }, SEC, { expiresIn: '1h' }) };
const aH = { Cookie: 'admin_token=' + jwt.sign({ sub: 1, username: 'admin', aud: 'admin' }, SEC, { expiresIn: '1h' }) };

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  PASS ' + m); } else { fail++; console.log('  FAIL ' + m); } };

let r = await fetch(B + '/api/surveys/1', { headers: uH });
ok(r.status === 200, 'GET /api/surveys/1 -> ' + r.status);
const survey = await r.json();
const q1 = survey.questions.find(q => q.ord === 1);
const q2 = survey.questions.find(q => q.ord === 2);
ok(q1 && q1.options.length === 3, 'track question has 3 options (IN-clause + ordering)');

const body = { answers: [
  { question_id: q1.id, selected_option_ids: [q1.options[0].id] },
  { question_id: q2.id, text_value: '컴퓨터공학과 / 인공지능' },
] };
r = await fetch(B + '/api/surveys/1/responses', { method: 'POST', headers: { ...uH, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const pr = await r.json();
ok(r.status === 201 && !!pr.response_id, 'POST response (tx insert) -> ' + r.status + ' id=' + pr.response_id);

r = await fetch(B + '/api/surveys/1/responses', { method: 'POST', headers: { ...uH, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
ok(r.status === 409, 'duplicate POST -> ' + r.status + ' (expect 409 / unique 23505)');

r = await fetch(B + '/api/surveys/1/my-response', { headers: uH });
const my = await r.json();
ok(r.status === 200 && my.answers.length === 2, 'GET my-response -> ' + r.status + ' answers=' + (my.answers ? my.answers.length : 0));
ok(Array.isArray(my.answers.find(a => a.question_id === q1.id)?.selected_option_ids), 'selected_option_ids JSON parsed back to array');

r = await fetch(B + '/api/admin/stats', { headers: aH });
const st = await r.json();
ok(r.status === 200 && st.total_responses === 1, 'admin/stats total=' + st.total_responses);
ok(st.track_distribution.length === 1, 'track_distribution (json_extract->jsonb cast + GROUP BY): ' + JSON.stringify(st.track_distribution));
ok(st.top_preferences.length >= 1, 'top_preferences: ' + JSON.stringify(st.top_preferences));

r = await fetch(B + '/api/surveys/1/statistics', { headers: uH });
ok(r.status === 200, 'GET /api/surveys/1/statistics -> ' + r.status);

r = await fetch(B + '/api/admin/responses.csv', { headers: aH });
const csv = await r.text();
ok(r.status === 200 && csv.includes('컴퓨터공학과'), 'CSV export contains submitted data');

console.log('\nRESULT: ' + pass + ' pass, ' + fail + ' fail');
process.exit(fail ? 1 : 0);
