# PNU-GRAD 배포 가이드

학·석사 연계과정 신청 사이트(부산대 AI 거점대학) 배포 문서.
배포 담당자가 이 문서만 보고 처음부터 띄울 수 있도록 정리함.

---

## 1. 구성 개요

```
[브라우저] ──> (선택: 리버스 프록시 / HTTPS) ──> Express :3001 ──> PostgreSQL :5432
                                                   │
                                                   └─ frontend/dist (정적 SPA) 서빙
```

- **프론트엔드**: Vite + React. `frontend/dist`로 빌드됨. 폰트·GSAP·Plotly 차트가 **전부 로컬 번들**되어 있어 인터넷 없이도 동작(폐쇄망 OK).
- **백엔드**: Express(Node.js). `node src/server.js`. 운영 모드에선 위 `dist`를 같은 포트(3001)에서 정적 서빙 + SPA 라우팅 처리.
- **DB**: PostgreSQL **필수**. 서버가 시작하자마자 DB에 연결하므로, DB가 없으면 백엔드가 뜨지 않음.

---

## 2. 사전 준비물 (대상 서버에 설치)

| 항목 | 버전 | 비고 |
|---|---|---|
| Node.js | 20 LTS 이상 | `node -v` 로 확인 |
| PostgreSQL | 14 이상 | 5432 포트 |
| 코드 | 이 저장소 전체 | `frontend/`, `backend/` 포함 |

> 폐쇄망 서버라면 Node.js / PostgreSQL 설치 파일을 미리 받아 반입해야 함.

---

## 3. 배포 절차 (순서대로)

아래는 Windows PowerShell 기준. (리눅스도 명령만 동일 의미로 치환하면 됨)

### 3-1. PostgreSQL DB / 계정 생성

기본값으로 `user=pnug / password=pnug / db=pnug` 를 기대함. (4-1의 `.env`에서 바꿀 수 있음)

```sql
-- psql 관리자(postgres)로 접속해서 실행
CREATE USER pnug WITH PASSWORD 'pnug';
CREATE DATABASE pnug OWNER pnug;
```

### 3-2. 백엔드 환경설정 파일 작성

`backend/.env` 파일을 새로 만든다. (예시는 `backend/.env.example` 참고)
폐쇄망/내부망 최소 구성 예시:

```env
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://<서버주소>:3001

# DB (위 3-1 기본값과 일치해야 함). 다른 DB면 DATABASE_URL 한 줄로 대체 가능.
PGHOST=localhost
PGPORT=5432
PGUSER=pnug
PGPASSWORD=pnug
PGDATABASE=pnug
# DATABASE_URL=postgres://pnug:pnug@localhost:5432/pnug

# 관리자/인증 토큰 서명키 (반드시 임의의 긴 문자열로 교체)
JWT_SECRET=<48바이트 정도의 임의 문자열로 교체>
ADMIN_JWT_EXPIRES_IN=2h

# 최초 관리자 계정 부트스트랩 (init-db 시 1회 생성 → 생성 후 이 두 줄은 지우는 걸 권장)
ADMIN_BOOTSTRAP_USERNAME=admin
ADMIN_BOOTSTRAP_PASSWORD=<관리자 초기 비밀번호>

# === 아래는 인터넷 연결이 있을 때만 동작 (폐쇄망에선 비워둬도 됨) ===
# Google 로그인(신청자 인증) — 없으면 Google 로그인 기능만 비활성
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://<서버주소>:3001/auth/google/callback
ALLOWED_EMAIL_DOMAIN=pusan.ac.kr
# Google Sheets 미러(선택) — 비우면 비활성
GOOGLE_SHEETS_ID=
```

> `JWT_SECRET`은 관리자 로그인 토큰 서명에 쓰이므로 **반드시 교체**. 기본값/빈 값으로 두지 말 것.

### 3-3. 의존성 설치

```powershell
cd <repo>\backend
npm install
cd <repo>\frontend
npm install
```

### 3-4. DB 초기화 (스키마 + 설문/관리자 시드)

```powershell
cd <repo>\backend
npm run init-db
```

- 설문(id=1)과 `ADMIN_BOOTSTRAP_*` 계정을 생성한다.
- 완료 후 `backend/.env`에서 `ADMIN_BOOTSTRAP_USERNAME/PASSWORD` 두 줄은 지우는 걸 권장.

### 3-5. 프론트엔드 빌드

```powershell
cd <repo>\frontend
npm run build      # frontend\dist 생성
```

### 3-6. 백엔드(운영) 실행

```powershell
cd <repo>\backend
$env:NODE_ENV = "production"
node src/server.js
```

정상 로그 예:
```
Backend listening on http://localhost:3001 (production)
[prod] Static serving: ...\frontend\dist
```

→ 브라우저에서 **http://<서버주소>:3001/** 접속.
- 게이트웨이에서 `01 A.U.R.A 마스터플랜 및 데이터룸` → 다크 사이트로 이동
- 관리자: `http://<서버주소>:3001/admin/login` (3-2의 부트스트랩 계정)

> 상시 구동하려면 Windows 서비스 등록(NSSM 등) 또는 PM2/작업 스케줄러로 `node src/server.js`를 데몬화 권장.

---

## 4. (선택) 도메인 + HTTPS

외부 공개(인터넷)용일 때만 해당. **폐쇄망에서는 건너뛴다.**

- `start-caddy.bat`은 Caddy 리버스 프록시(도메인 `pnug.kodekorea.kr` → `localhost:3001`, Let's Encrypt 자동 인증서)를 가정함.
- 단, 이 저장소에는 `Caddyfile`과 `caddy/` 폴더, `caddy.exe`가 **포함되어 있지 않음**. 사용하려면 담당자가 `caddy.exe`와 Caddyfile을 별도 준비해야 함.
- Let's Encrypt는 인증서 발급에 인터넷이 필요하므로 **폐쇄망에서는 동작하지 않음**. 내부망 HTTPS가 필요하면 사내 인증서(또는 IIS/nginx 리버스 프록시 + 내부 인증서)를 쓰고, `backend/.env`의 `FRONTEND_URL`/`GOOGLE_REDIRECT_URI`를 해당 https 주소로 맞춘다.

HTTPS/도메인을 쓸 경우 `.env` 변경점:
```env
FRONTEND_URL=https://<도메인>
GOOGLE_REDIRECT_URI=https://<도메인>/auth/google/callback
```

---

## 5. 폐쇄망(인터넷 차단) 환경에서의 동작 정리

| 기능 | 폐쇄망 동작 | 비고 |
|---|---|---|
| 페이지/레이아웃 | ✅ 정상 | |
| 폰트(Pretendard, JetBrains Mono 등) | ✅ 정상 | 로컬 번들됨 |
| GSAP 스크롤 애니메이션 | ✅ 정상 | JS 번들 포함 |
| Plotly 차트(지역 데이터룸) | ✅ 정상 | `public/vendor/plotly-2.26.0.min.js` 로컬 |
| 관리자 로그인(자체 ID/PW) | ✅ 정상 | DB만 있으면 됨 |
| Google 로그인(신청자) | ❌ 실패 | 구글 서버 접속 필요 — 정상적인 제약 |
| Google Sheets 미러 | ❌ 비활성 | 〃 |
| 관리자 화면의 "시트 열기" 링크 | ❌ 안 열림 | 외부 링크라 정상 |

> 폐쇄망 동작을 사전 검증하려면 인터넷 되는 PC에서 `closednet-sim.bat`(관리자 권한)로 구글 도메인만 차단 → 사이트 확인 → 끝나면 `[2] Block OFF`로 복구.

---

## 6. 제공된 배치 파일(.bat) 요약 (Windows, repo 루트)

| 파일 | 용도 |
|---|---|
| `start.bat` | 개발 모드. 백엔드(:3001)+프론트(:5173) 각각 dev 서버로 실행 |
| `build-test.bat` | 로컬에서 운영 흉내: 빌드 → 백엔드(prod) 실행 (DB 필요) |
| `start-prod.bat` | 운영 실행: 프론트 빌드 → 백엔드 실행 |
| `start-caddy.bat` | Caddy HTTPS 리버스 프록시 (caddy.exe/Caddyfile 별도 필요) |
| `closednet-sim.bat` | 폐쇄망 흉내 테스트(hosts로 구글 차단/복구, 관리자 권한) |
| `stop.bat` | 3001/5173 포트 점유 프로세스 종료 |

> 위 .bat은 보조용. 운영 서버에서는 3장 절차(특히 3-6)를 직접 실행하는 것을 권장.

---

## 7. 자주 나는 오류

| 증상 | 원인 / 조치 |
|---|---|
| `Cannot find package 'express'` | 백엔드 의존성 미설치 → `cd backend && npm install` |
| `ECONNREFUSED ... :5432` | PostgreSQL 미실행/미생성 → 3-1 수행, 서비스 기동 확인 |
| 화면은 뜨는데 차트가 "로딩 중"에서 멈춤 | `public/vendor/plotly-2.26.0.min.js` 누락 → 빌드 다시(`npm run build`) |
| 관리자 로그인 토큰 오류 | `.env`의 `JWT_SECRET` 미설정 → 임의 문자열로 설정 후 재시작 |
| prod인데 정적 서빙 안 됨/`dist 없음` 경고 | `frontend`에서 `npm run build` 먼저 |
