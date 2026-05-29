# ADR 0002 — 관리자는 자체 ID/PW, OAuth 사용 안 함

- 상태: Accepted
- 날짜: 2026-05-29

## 컨텍스트

신청자는 Google OAuth + 도메인 게이트(`@pusan.ac.kr`)로 인증. 관리자(학사사무실 직원 1~5명)에게도 OAuth를 쓰려면:

- 부산대 이메일이 필수가 됨 (학사 직원이 부산대 이메일 없으면 곤란)
- 도메인 게이트가 부산대 전체 학생/교직원을 통과시키므로 admin 추가 식별 필요 (ENV 화이트리스트, role 컬럼 등)
- 학사 직원이 본인 Google 계정으로 로그인하는 흐름은 부서 공용 PC 환경에 안 맞음

## 결정

**관리자는 username + bcrypt PW로 자체 인증. OAuth 무관.**

- 같은 백엔드의 `/admin` 라우트, 별도 쿠키(`admin_token`)
- DB의 `admins(username, password_hash)` 테이블
- 초기 1명은 `.env`의 `ADMIN_BOOTSTRAP_*`로 시드, 사용 후 env에서 제거 권장
- 신청자 토큰과 관리자 토큰은 격리 (cross-API 호출 시 401)

## 결과

긍정:
- 학사 직원이 부산대 이메일 없이도 admin 가능 (인사이동 시 자유로움)
- 도메인 게이트와 관리자 권한이 완전 분리 — admin 권한 부여/회수가 학사 도메인 정책에 결합되지 않음
- 부서 공용 PC에서 로그아웃·재로그인 간단

부정:
- ID/PW는 OAuth보다 유출/추측 위험 높음 — 강한 PW + HTTPS 필수
- 처음 1명 부트스트랩 시점에 평문 PW가 .env에 들어감 (사용 후 즉시 제거 필요)
- admin 추가/PW 변경 UI는 MVP에 없음 — 별도 CLI 스크립트

## 검토한 대안

- **ENV 이메일 화이트리스트** — admin도 OAuth로 로그인, .env에 admin 이메일 목록. 부산대 이메일 의존성 남음. 기각.
- **DB role 컬럼** — admin도 OAuth + users.role. role 관리 UI 추가 부담. 기각.
- **Google Workspace 그룹** — 학교 인프라 협조 필요. MVP에 과함. 기각.
