# pnu-grad — Context Glossary

부산대학교 학·석사 연계과정 사전 신청 시스템.

---

## 도메인 용어

### 응답 (response)
신청자가 시안 페이지의 신청 모달을 통해 제출한 **사전 신청서 1건**. 코드에서는 `responses` + `answers` 두 테이블에 분리 저장된다(설문 도메인 모델 재사용). 캐논 용어는 **"응답"**.

**수집·저장 항목은 최소화**한다 — 검증된 이메일(OAuth, `@pusan.ac.kr`) + 희망 트랙(①학·석사 / ②학·석박사통합 / ③전환) + **3지망**(각 학과+전공)만 저장. 학번·이름·평점·이수학기 등은 수집·저장하지 않는다(이메일로 내부 식별 가능, 평점·학점·학기는 별도 **자격 확인**에서 자가 입력만 — 미저장). → [`docs/adr/0005`](./docs/adr/0005-response-data-minimization-3choices.md)

### 지망 (志望)
신청자가 학과 디렉터리에서 고른 **희망 진학 학과+전공**, 우선순위 1~3 (최소 1, 최대 3). 각 지망 = (학과, 전공) 쌍 — 학과를 고르면 그 학과의 전공 중 선택(전공이 하나면 자동). 선택지는 부산대 일반대학원 **모집(○) 학과**(대학원 모집요강 기준).

### 학과 디렉터리 / 계열
일반대학원 학과를 **계열**(인문·사회 / 자연과학 / 공학 / 예술 / 체육 / 의약·생명)·**BK21 참여 여부(★)**·학과명 키워드로 필터·검색하는 목록. BK21 참여학과는 홍보문구·사업단 홈페이지 링크로 보강(나머지는 학과명·계열·전공만). 데이터 출처: 대학원 모집요강 PDF(학과·계열·★) + BK21 사업단 표(홍보문구·URL).

**사전 신청(응답) ≠ 정식 지원서.** 응답은 본 시스템이 수집·저장하는 사전 접수 데이터일 뿐, 학사 제출용 **정식 지원서 양식**과는 별개다. 정식 지원서·모집요강·수료학점 기준표 등 문서의 공식 출처는 **소속 단과대학 홈페이지/학과 사무실**이며, 본 시스템은 이를 호스팅하거나 이메일로 발송하지 않는다 (자료실·다운로드 없음 — [`docs/adr/0004`](./docs/adr/0004-no-resource-board-forms-via-college-sites.md)).

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
> ADR 0005로 **개인정보 최소화** 반영 — 학번·이름·학과·이수학기 컬럼 제거, 3지망 추가.

| 컬럼 | 출처 |
|---|---|
| submitted_at | responses.submitted_at |
| response_id | responses.id |
| email | users.email (OAuth 검증) |
| 희망 트랙 | answers[트랙].option label |
| 1지망 | answers[지망1] 학과+전공 |
| 2지망 | answers[지망2] 학과+전공 |
| 3지망 | answers[지망3] 학과+전공 |

첫 sync 전 시트 1행에 헤더 자동 작성.

---

## 관리자 페이지

- 위치: **React 라우트** (`/admin/login`, `/admin`). `frontend/src/pages/AdminLogin.jsx` + `AdminDashboard.jsx`
- 라우트 우선순위: admin 라우트가 `*` → `/admission.html` redirect 규칙보다 위에 있어야 함
- 신청자 OAuth 가드와 분리된 자체 가드 (admin 미로그인 시 `/admin/login`으로)
- 시안과 시각적으로 분리된 톤 (어두운 또는 표 중심 미니멀)
- 역할: **신청 현황 통계 + 시트 게이트웨이**
  - 카드: 총 신청수, 트랙별 분포, 지망 학과 top, 계열 분포, 최근 24h 신청수, 미동기화 건수
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

- **PII 최소화 (ADR 0005)** — 이제 Sheets/SQLite에 **이메일 + 트랙 + 3지망(학과·전공)** 만 저장한다. 학번·이름·평점·학기는 수집하지 않는다. 그래도 `@pusan.ac.kr` 이메일은 개인 식별자이므로 Google Cloud 저장 적합성은 여전히 **사용자 책임으로 확인**(금지 시 시트 미러 제거 + CSV 다운로드만).
