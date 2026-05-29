# pnu-grad — Context Glossary

부산대학교 학·석사 연계과정 사전 신청 시스템.

---

## 도메인 용어

### 응답 (response)
신청자가 시안 페이지의 신청 모달을 통해 제출한 **사전 신청서 1건**. 코드에서는 `responses` + `answers` 두 테이블에 분리 저장된다. 도메인상으로는 "사전 신청서"에 더 가까우나, 캐논 용어는 **"응답"** 으로 유지 (설문 도메인 모델 재사용).

### 신청자 (applicant)
- 인증된 사용자 중 신청서를 제출했거나 제출 자격이 있는 자
- 도메인 게이트(`@pusan.ac.kr`)를 통과한 모든 학생
- 1인 1응답 — 같은 신청자가 두 번 제출할 수 없음 (`UNIQUE(survey_id, user_id)` 강제)

### 관리자 (admin)
- 시안의 일반 신청자와 **분리된 역할**
- 신청 결과를 조회하고 학사 의사결정에 사용
- **자체 ID/PW 인증** (Google OAuth 사용 안 함, 도메인 게이트와 무관)
- 같은 백엔드의 `/admin` 경로에서 처리. 신청자(`token` 쿠키)와 관리자(`admin_token` 쿠키) 격리
- API 네임스페이스: `/api/admin/*`
- 신청자 페이지에서 admin 페이지로 가는 메뉴는 노출하지 않음 (URL을 아는 사람만 진입)
- 계정 저장: SQLite `admins(id, username, password_hash, created_at, last_login_at)`, **bcryptjs** 해시
- 초기 1명: `.env`의 `ADMIN_BOOTSTRAP_USERNAME/PASSWORD`로 `init-db.js`에서 시드. 시드 후 `.env`에서 제거 권장
- PW 변경: MVP는 별도 CLI 스크립트. 향후 admin UI에 폼 (선택)

### 도메인 게이트
`@pusan.ac.kr` 이메일 도메인 검증. 백엔드 `isAllowedDomain()`가 단일 진실. 시안 클라이언트는 우회할 수 없다.

### 시트 미러 (sheet mirror)
응답이 SQLite에 INSERT된 직후 Google Sheets의 응답 시트에 1행 append되는 일방향 동기화. 시트는 **read-only 거울**이며 SoT 아님.

---

## 저장 모델

### 진실 공급원 (SoT)
**로컬 SQLite (`backend/data.sqlite`)** 가 모든 응답·사용자·설문 구성·관리자 계정의 단일 SoT.

### Google Sheets 미러
- 일방향 동기화 (SQLite → Sheets). 시트에서 SQLite로 역방향 sync 없음
- Sheets API 장애가 응답 자체를 차단하지 않는다 (fail open)
- 시트가 망가지면 SQLite로부터 언제든 재생성 가능
- 1인 1응답·도메인 게이트는 SQLite 레벨에서 강제

### 미러 타이밍
**Fire-and-forget**. 응답 트랜잭션 commit 직후 `mirrorToSheet().catch(log)` 비동기 호출. 응답 latency에 영향 없음.

### 누락 복구
- `responses.sheet_synced_at` 컬럼이 NULL인 응답은 시트에 아직 없음
- admin dashboard에 미동기화 건수 배너 + "재동기화" 버튼 (`POST /api/admin/sync`)
- 재동기화는 `sheet_synced_at IS NULL` 응답만 일괄 append → 성공한 것만 컬럼 채움
- 완벽한 idempotency 없음 (append 성공 후 컬럼 update 실패 케이스에서 중복 1행 발생 가능). 트래픽 작아 admin이 수동 정리하면 됨

### 시트 인증
**Service Account**. JSON 키 파일을 `backend/credentials/sheets-sa.json`에 두고 `.env`의 `GOOGLE_SHEETS_ID`로 대상 시트 지정. Service Account 이메일을 시트의 "편집자"로 공유 처리.

### 시트 컬럼 스키마
| 컬럼 | 출처 |
|---|---|
| submitted_at | responses.submitted_at |
| response_id | responses.id |
| email | users.email |
| name | users.name |
| 학번 | answers[Q1].text_value |
| 학과(부) | answers[Q2].text_value |
| 이수학기 | answers[Q3].option label |
| 희망 트랙 | answers[Q4].option label |
| 진학희망 학과 | answers[Q5].text_value |
| 개인정보 동의 | answers[Q6].option label |

첫 sync 전 시트 1행에 헤더 자동 작성.

---

## 관리자 페이지

- 위치: **React 라우트** (`/admin/login`, `/admin`). `frontend/src/pages/AdminLogin.jsx` + `AdminDashboard.jsx`
- 라우트 우선순위: admin 라우트가 `*` → `/admission.html` redirect 규칙보다 위에 있어야 함
- 신청자 OAuth 가드와 분리된 자체 가드 (admin 미로그인 시 `/admin/login`으로)
- 시안과 시각적으로 분리된 톤 (어두운 또는 표 중심 미니멀)
- 역할: **신청 현황 통계 + 시트 게이트웨이**
  - 카드: 총 신청수, 트랙별 분포, 이수학기 분포, 학과 top 5, 최근 24h 신청수, 미동기화 건수
  - 액션: Google Sheets 새 탭, CSV 다운로드, 재동기화 버튼
  - 상세 표는 자체 UI로 만들지 않음 — 시트로 위임

---

## 인증 요약

| 사용자 종류 | 인증 방식 | 쿠키 이름 | 만료 | 게이트 |
|---|---|---|---|---|
| 신청자 | Google OAuth | `token` | 7일 | `@pusan.ac.kr` 도메인 |
| 관리자 | username + bcrypt PW | `admin_token` | 2시간 | DB의 `admins` 테이블 |

두 토큰은 서로 격리. admin 토큰으로 시안 API 호출하면 401. 신청자 토큰으로 admin API 호출하면 401. JWT_SECRET은 양쪽 별도 발급 가능하지만 MVP는 같은 시크릿 + 다른 audience 클레임으로 구분.

---

## 컴플라이언스 짚어둘 것

- **PII가 Google Cloud로 나간다** — 학번/이메일/이름이 Sheets에 저장됨. 부산대학교 학사 데이터의 외부 클라우드 저장이 학칙/정보보호 정책상 허용되는지 **사용자 책임으로 확인 필요**. 만약 금지면 시트 미러 자체를 빼고 CSV 다운로드만으로 가야 함.
