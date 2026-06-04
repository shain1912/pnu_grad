# pnu-grad

부산대학교 학·석사 연계과정 사전 신청 시스템.

## 구성
- **시안 페이지 3종** (`/admission.html` 인덱스 + 블루/그린/다크) — 일반 신청자용 standalone HTML
- **신청 모달** → Google OAuth(`@pusan.ac.kr` 도메인 게이트) → SQLite 응답 저장
- **관리자 콘솔** (`/admin`) — 자체 ID/PW, 통계 카드 + Google Sheets 미러 + CSV 다운로드
- 도메인 결정/용어는 [`CONTEXT.md`](./CONTEXT.md) 와 [`docs/adr/`](./docs/adr/) 참고

## 개발 모드 (localhost)
의존성 설치 + DB 초기화 (최초 1회):
```bash
cd backend && npm install
cd ../frontend && npm install
cd ../backend && node --experimental-sqlite src/init-db.js
```
이후엔 루트의 `start.bat` 더블클릭. `stop.bat`으로 종료.

## .env 변수 목록
`backend/.env.example` 참조. 핵심:

| 변수 | dev | prod (pnug.kodekorea.kr) |
|---|---|---|
| `NODE_ENV` | `development` | `production` |
| `FRONTEND_URL` | `http://localhost:5173` | `https://pnug.kodekorea.kr` |
| `GOOGLE_REDIRECT_URI` | `http://localhost:3001/auth/google/callback` | `https://pnug.kodekorea.kr/auth/google/callback` |
| `JWT_SECRET` | dev placeholder | `openssl rand -base64 48` |
| `ADMIN_BOOTSTRAP_*` | 시드 후 비움 | 시드 후 비움 |

Google Sheets 미러를 켜려면:
- Service Account JSON을 `backend/credentials/sheets-sa.json`에 저장
- 그 SA 이메일을 시트의 **편집자**로 공유
- Cloud Console에서 Sheets API 활성화

---

## 프로덕션 배포 — pnug.kodekorea.kr (Caddy + 공유기 포트포워딩)

### 흐름
```
브라우저 ──HTTPS:443──▶ 공유기 ──443/80──▶ PC(Caddy) ──HTTP:3001──▶ Express ──▶ SQLite + Google Sheets
```

### 1. `backend/.env` 수정 (사용자 직접)
```
NODE_ENV=production
FRONTEND_URL=https://pnug.kodekorea.kr
GOOGLE_REDIRECT_URI=https://pnug.kodekorea.kr/auth/google/callback
JWT_SECRET=<openssl rand -base64 48 결과>
ADMIN_BOOTSTRAP_USERNAME=admin
ADMIN_BOOTSTRAP_PASSWORD=<강한 PW로 변경>   ← 시드 후 .env에서 제거
```

### 2. Google Cloud Console 권한 수정 ⚠
이거 안 하면 OAuth `redirect_uri_mismatch` 로 실패.

**A. OAuth Client** — https://console.cloud.google.com/apis/credentials
클라이언트(`1092933218620-...`) 편집 →
- **Authorized JavaScript origins**: `https://pnug.kodekorea.kr`
- **Authorized redirect URIs**: `https://pnug.kodekorea.kr/auth/google/callback`
- 기존 localhost 항목은 dev용으로 유지
- 저장 (반영까지 수 분)

**B. OAuth Consent Screen** — https://console.cloud.google.com/apis/credentials/consent
- **Authorized domains** 에 `kodekorea.kr` 추가
- Publishing status가 Testing이면 → Test users에 본인/테스터 이메일 추가, 또는 In Production publish

**C. Sheets API / Service Account** — 도메인 변경 영향 없음. 그대로 OK.

### 3. Caddy 설치 + 실행
자세한 가이드: [`caddy/README.md`](./caddy/README.md)

**설치** (택일):
```cmd
winget install caddyserver.caddy
:: 또는 https://github.com/caddyserver/caddy/releases 에서 windows_amd64.zip 받아 pnu-grad\caddy\ 에 압축해제
```

**Caddyfile** (이미 `caddy/Caddyfile` 에 들어있음):
```caddyfile
pnug.kodekorea.kr {
    reverse_proxy localhost:3001
}
```

### 4. 공유기 포트포워딩
공유기 관리 페이지(보통 192.168.0.1) → 포트포워딩:
- 외부 **80** → 이 PC LAN IP **80** (Let's Encrypt HTTP-01 challenge + HTTPS redirect)
- 외부 **443** → 이 PC LAN IP **443** (HTTPS 본 트래픽)

### 5. Windows 방화벽
PowerShell 관리자:
```powershell
New-NetFirewallRule -DisplayName "Caddy HTTP"  -Direction Inbound -Protocol TCP -LocalPort 80  -Action Allow
New-NetFirewallRule -DisplayName "Caddy HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

### 6. DNS A 레코드
`kodekorea.kr` 네임서버에서:
- Host: `pnug`  Type: `A`  Value: 공인 IP

⚠ 공인 IP가 **동적**이면 DDNS 필요 (https://www.duckdns.org 등 무료).

### 7. 실행 (2개 터미널)
```cmd
:: 터미널 1 — backend (frontend 빌드 + Express)
start-prod.bat

:: 터미널 2 — Caddy
start-caddy.bat
```

브라우저로 https://pnug.kodekorea.kr 접속 → 첫 접속 시 Caddy가 Let's Encrypt 인증서 자동 발급 (수 초~수 분).

### 8. PC 재부팅 자동 시작 (선택)
[nssm](https://nssm.cc) 으로 백엔드/Caddy 둘 다 Windows 서비스 등록 가능. 자세한 건 `caddy/README.md` 6장.

---

## 보안 체크리스트
- [ ] `JWT_SECRET` 진짜 랜덤 48+ 바이트로 교체
- [ ] `ADMIN_BOOTSTRAP_PASSWORD` 강한 PW로 시드 후 .env 에서 제거
- [ ] `NODE_ENV=production` (쿠키 `secure: true` 자동)
- [ ] HTTPS 인증서 자물쇠 아이콘 확인
- [ ] OAuth redirect URI에 prod 도메인 등록됨
- [ ] Cloud Console OAuth consent에 prod 도메인 추가됨
- [ ] DB 백업 (`backup-$(date).sqlite`)
- [ ] (선택) admin 로그인 레이트 리미트 (`express-rate-limit`)

## 문서
- [`CONTEXT.md`](./CONTEXT.md) — 도메인 용어, 인증 모델, 시트 미러 정책
- [`caddy/README.md`](./caddy/README.md) — Caddy 셋업 상세
- [`docs/adr/0001`](./docs/adr/0001-sheets-as-mirror-not-source-of-truth.md) — 시트는 미러, SQLite가 SoT
- [`docs/adr/0002`](./docs/adr/0002-admin-uses-id-pw-not-oauth.md) — 관리자는 자체 ID/PW
- [`docs/adr/0003`](./docs/adr/0003-sheet-sync-fire-and-forget.md) — 시트 동기화는 fire-and-forget
- [`docs/adr/0004`](./docs/adr/0004-no-resource-board-forms-via-college-sites.md) — 자료실·게시판 없음, 양식은 단과대학 홈페이지로 위임
- [`docs/adr/0005`](./docs/adr/0005-response-data-minimization-3choices.md) — 응답 데이터 최소화(이메일+트랙+3지망), 개인정보 최소 수집
