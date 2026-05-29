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

| 변수 | dev | prod (pnug.kodekorea.kr 예시) |
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

## 프로덕션 배포 (도메인: pnug.kodekorea.kr)

### 1. 코드 / .env 준비
- `backend/.env`에서 위 표의 prod 컬럼 값으로 변경
- `JWT_SECRET` 새로 발급 (랜덤 48+ 바이트)
- `ADMIN_BOOTSTRAP_PASSWORD`를 강한 PW로 변경 → init-db로 시드 → `.env`에서 제거 권장
- `start-prod.bat` 실행 → frontend `npm run build` → backend가 `frontend/dist`를 정적 서빙

### 2. HTTPS 종단 + 도메인 연결
공인 IP를 직접 노출하지 말고 **HTTPS 리버스 프록시** 한 단 두는 것을 권장:

**옵션 A — Cloudflare Tunnel (가장 권장, 포트포워딩 불필요)**
```
1. Cloudflare에 kodekorea.kr 도메인 등록 (또는 이미 등록되어 있다면 skip)
2. https://one.dash.cloudflare.com → Networks → Tunnels → Create a tunnel
3. cloudflared 다운로드 후 PC에서 실행
4. Tunnel의 Public Hostname:
     Subdomain: pnug
     Domain:    kodekorea.kr
     Service:   http://localhost:3001
5. DNS CNAME pnug → <tunnel-id>.cfargotunnel.com 이 자동 생성됨
```
- 공유기 포트포워딩 불필요. HTTPS 자동.
- PC가 켜져 있어야 동작 (윈도우 서비스로 등록 가능).

**옵션 B — 공유기 포트포워딩 + Caddy/Nginx**
```
1. 공유기: 외부 443 → PC의 443 (또는 80→443 자동 리다이렉트)
2. DNS A 레코드: pnug.kodekorea.kr → 공인 IP
3. Caddy 설치 후 Caddyfile:
     pnug.kodekorea.kr {
       reverse_proxy localhost:3001
     }
   (Caddy가 Let's Encrypt로 자동 인증서 발급)
```
- 공인 IP가 동적이면 DDNS 필요.
- 공유기 포트 443 노출은 보안 위험 — 방화벽 룰 잘 짜기.

### 3. Windows 방화벽 (옵션 B용)
PowerShell 관리자:
```powershell
New-NetFirewallRule -DisplayName "PNU-GRAD HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```
옵션 A(Cloudflare Tunnel)는 outbound만 사용하므로 인바운드 규칙 불필요.

### 4. Google Cloud Console 권한 수정 ⚠
이 단계 안 하면 OAuth 가 redirect_uri_mismatch 로 실패함.

**A. OAuth Client 설정 변경**
https://console.cloud.google.com/apis/credentials → OAuth 클라이언트(`1092933218620-...`) 클릭

- **Authorized JavaScript origins** 에 추가:
  ```
  https://pnug.kodekorea.kr
  ```
- **Authorized redirect URIs** 에 추가:
  ```
  https://pnug.kodekorea.kr/auth/google/callback
  ```
- 기존 `http://localhost:3001/auth/google/callback` 항목은 dev용으로 그대로 유지
- 저장 후 반영까지 수 분 걸릴 수 있음

**B. OAuth Consent Screen**
https://console.cloud.google.com/apis/credentials/consent → 편집

- **Authorized domains** 에 `kodekorea.kr` 추가
- Publishing status가 "Testing"이면 → 자기 이메일을 Test users에 추가, 또는 "In production" 으로 publish (외부 사용자 받으려면 verification 필요할 수 있음 — 부산대 학생 한정이면 testing 으로도 가능, 단 100명/refresh-token 7일 제한 있음)

**C. Sheets API / Service Account (이미 했으면 스킵)**
- Sheets API는 이미 활성화됨 (project `1092933218620` 기준)
- Service Account `pnu-test@gen-lang-client-0345297195.iam.gserviceaccount.com` 가 대상 시트의 편집자로 공유됨
- 도메인 변경 영향 없음

### 5. 실행
```cmd
start-prod.bat
```
또는 수동:
```cmd
cd frontend && npm run build
cd ../backend && set NODE_ENV=production && node --experimental-sqlite src/server.js
```
+ 옵션 A면 `cloudflared` 별도 실행 / 옵션 B면 Caddy 실행.

## 보안 체크리스트 (프로덕션 전)
- [ ] `JWT_SECRET` 진짜 랜덤 48+ 바이트로 교체
- [ ] `ADMIN_BOOTSTRAP_PASSWORD` 강한 PW로 시드 후 .env 에서 제거
- [ ] `NODE_ENV=production` (쿠키 `secure: true` 자동)
- [ ] HTTPS 종단 동작 확인 (브라우저 자물쇠 아이콘)
- [ ] OAuth redirect URI에 prod 도메인 등록됨
- [ ] Cloud Console OAuth consent에 prod 도메인 추가됨
- [ ] 레이트 리미트 (`express-rate-limit`) — 선택, admin brute force 방지
- [ ] DB 백업 cron (`cp data.sqlite backup-$(date).sqlite`)

## 문서
- [`CONTEXT.md`](./CONTEXT.md) — 도메인 용어, 인증 모델, 시트 미러 정책
- [`docs/adr/0001`](./docs/adr/0001-sheets-as-mirror-not-source-of-truth.md) — 시트는 미러, SQLite가 SoT
- [`docs/adr/0002`](./docs/adr/0002-admin-uses-id-pw-not-oauth.md) — 관리자는 자체 ID/PW
- [`docs/adr/0003`](./docs/adr/0003-sheet-sync-fire-and-forget.md) — 시트 동기화는 fire-and-forget
