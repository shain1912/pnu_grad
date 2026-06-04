// 라이브 서버 읽기전용 E2E (컨테이너 내부 실행, 실 JWT_SECRET 사용 — prod 데이터 변경 없음)
import jwt from 'jsonwebtoken';
const B = 'http://localhost:3001';
const SEC = process.env.JWT_SECRET;
const uH = { Cookie: 'token=' + jwt.sign({ sub: 1, email: 'admin@pusan.ac.kr', name: 'x' }, SEC, { expiresIn: '1h' }) };
const aH = { Cookie: 'admin_token=' + jwt.sign({ sub: 1, username: 'admin', aud: 'admin' }, SEC, { expiresIn: '1h' }) };
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else fail++; console.log((c ? '  PASS ' : '  FAIL ') + m); };
let r;
r = await fetch(B + '/api/surveys/1'); ok(r.status === 401, 'no-auth /api/surveys/1 -> 401 (got ' + r.status + ')');
r = await fetch(B + '/api/surveys/1', { headers: uH });
const s = await r.json();
ok(r.status === 200 && (s.questions?.length ?? 0) >= 2, 'authed /api/surveys/1 -> ' + r.status + ' questions=' + (s.questions?.length ?? 0));
r = await fetch(B + '/api/admin/stats', { headers: aH });
const st = await r.json();
ok(r.status === 200, 'admin/stats -> ' + r.status + ' total=' + st.total_responses + ' track=' + JSON.stringify(st.track_distribution || []));
console.log('\nLIVE-READ: ' + pass + ' pass, ' + fail + ' fail');
process.exit(fail ? 1 : 0);
