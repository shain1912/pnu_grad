# pnu-grad

부산대학교 학·석사 연계과정 사전 신청 시스템.

## 구성
- **시안 페이지 3종** (`/admission.html` 인덱스 + 블루/그린/다크) — 일반 신청자용 standalone HTML
- **신청 모달** → Google OAuth(`@pusan.ac.kr` 도메인 게이트) → SQLite 응답 저장
- **관리자 콘솔** (`/admin`) — 자체 ID/PW, 통계 카드 + Google Sheets 미러 + CSV 다운로드
- 도메인 결정/용어는 [`CONTEXT.md`](./CONTEXT.md) 와 [`docs/adr/`](./docs/adr/) 참고

## 실행
의존성 설치 + DB 초기화 (최초 1회):
```bash
cd backend && npm install
cd ../frontend && npm install
cd ../backend && node --experimental-sqlite src/init-db.js
```

이후엔 루트의 `start.bat` 더블클릭. `stop.bat`으로 종료.

## 필요한 .env (backend/.env)
```
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

JWT_SECRET=<랜덤 32바이트 이상>
JWT_EXPIRES_IN=7d
ADMIN_JWT_EXPIRES_IN=2h

GOOGLE_CLIENT_ID=<Google Cloud Console OAuth>
GOOGLE_CLIENT_SECRET=<동일>
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
ALLOWED_EMAIL_DOMAIN=pusan.ac.kr

# 초기 관리자 부트스트랩 (init-db 시 시드, 사용 후 비울 것)
ADMIN_BOOTSTRAP_USERNAME=admin
ADMIN_BOOTSTRAP_PASSWORD=<강한 PW>

# Google Sheets 미러 (선택)
GOOGLE_SHEETS_ID=<시트 ID>
GOOGLE_SHEETS_SA_KEY_PATH=./credentials/sheets-sa.json
GOOGLE_SHEETS_TAB=Responses
```

Google Sheets 미러를 켜려면 추가로:
- Service Account JSON 키를 `backend/credentials/sheets-sa.json`에 저장
- 그 SA 이메일을 대상 시트의 **편집자**로 공유
- Google Cloud Console 에서 Sheets API 활성화 (Service Account 의 project_id)

## LAN 전역 노출
백엔드와 Vite dev 서버 모두 `0.0.0.0`에 listen 중이라 LAN에서 IP로 접근 가능. 하지만 OAuth가 제대로 동작하려면:

1. **Windows 방화벽 인바운드 허용** (PowerShell 관리자):
   ```powershell
   New-NetFirewallRule -DisplayName "PNU-GRAD Backend"  -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow
   New-NetFirewallRule -DisplayName "PNU-GRAD Frontend" -Direction Inbound -Protocol TCP -LocalPort 5173 -Action Allow
   ```
2. **backend/.env 수정** — `localhost`를 LAN IP로:
   ```
   FRONTEND_URL=http://192.168.x.x:5173
   GOOGLE_REDIRECT_URI=http://192.168.x.x:3001/auth/google/callback
   ```
3. **Google Cloud Console** → OAuth 클라이언트의 "승인된 리디렉션 URI"에 위 LAN IP 형태 URI **추가** (localhost 항목은 그대로 유지)
4. 백엔드 재시작 시 콘솔 로그에 LAN IP가 표시됨

⚠ Google이 `http://` 외부 호스트를 일부 거부할 수 있음 — 그땐 mkcert로 LAN HTTPS 또는 ngrok 같은 터널링 사용.

## 인터넷 공개 시 (추가)
- HTTPS 종단 (Nginx / Caddy / Cloudflare Tunnel)
- `NODE_ENV=production` (쿠키 `secure: true` 자동)
- `JWT_SECRET` 진짜 랜덤 48바이트
- 초기 부트스트랩 PW 사용 후 즉시 변경 + `.env`에서 제거
- 레이트 리미트 (`express-rate-limit`) — admin 로그인 brute force 방지
- Vite는 **prod 빌드** (`cd frontend && npm run build`) → `dist/`를 Express나 Nginx로 정적 서빙

## 문서
- [`CONTEXT.md`](./CONTEXT.md) — 도메인 용어, 인증 모델, 시트 미러 정책
- [`docs/adr/0001`](./docs/adr/0001-sheets-as-mirror-not-source-of-truth.md) — 시트는 미러, SQLite가 SoT
- [`docs/adr/0002`](./docs/adr/0002-admin-uses-id-pw-not-oauth.md) — 관리자는 자체 ID/PW
- [`docs/adr/0003`](./docs/adr/0003-sheet-sync-fire-and-forget.md) — 시트 동기화는 fire-and-forget
