# pnu-grad 배포 인수인계 (arise-ai.pusan.ac.kr)

배포일: 2026-06-04 · 대상: `ubuntu@164.125.19.178:11097` (내부 10.125.19.178) · Ubuntu 24.04 폐쇄망

## 현재 상태 (LIVE)
- **Docker 29.5.3** 오프라인 설치(static binaries + systemd, 부팅 자동시작) — 서버는 인터넷 불가라 이미지는 `docker load`로 적재
- **스택**: `~/pnug-stack/docker-compose.yml` (= `deploy/docker-compose.https.yml`) = `nginx`(80/443 TLS 종단) + `was`(Express, PostgreSQL) + `postgres:16`
- **HTTP·HTTPS 둘 다 LIVE + 외부 도달 확인**:
  - `http://arise-ai.pusan.ac.kr/` → 200
  - `https://arise-ai.pusan.ac.kr/` → 200 (TLS1.3). **부산대가 80·443 둘 다 우리 서버로 포워딩함** (TLS 종단은 우리 nginx).
  - 인증서: **Let's Encrypt 정식 인증서** (ssl_verify=0, 브라우저 경고 없음). 만료 2026-09-02.
  - HTTPS에서 X-Forwarded-Proto=https 전달 → **관리자/OAuth secure 쿠키 동작 확인됨**.
  - ※ `pusan.ac.kr`은 브라우저 **HSTS preload** 도메인이라 유효 인증서가 필수(self-signed·HTTP 불가).
- DB는 마이그레이션 완료(SQLite→PostgreSQL). 시드(설문 id=1, admin 계정) 완료.

### 인증서 발급 방식 (DNS/전산팀 불필요)
**Let's Encrypt HTTP-01 stateless** — ACME 클라이언트(acme.sh)는 인터넷 되는 **WSL**에서 돌리고,
검증은 부산대가 포워딩하는 **서버 :80**으로 받음. nginx 80 블록에 stateless 챌린지 응답 location이 박혀 있음
(`return 200 "$1.<thumbprint>"`). 발급 스크립트: `deploy/acme-issue.sh` → `deploy/acme-install.sh`.

### 인증서 갱신 (90일, 자동 아님)
만료 전(ARI 권장 ~2026-08-03) WSL에서:
```bash
~/.acme.sh/acme.sh --renew -d arise-ai.pusan.ac.kr --ecc --force   # :80 stateless로 재검증·발급
bash <(tr -d '\r' < /mnt/c/Users/user/pnu-grad/deploy/acme-install.sh)  # 서버 복사 + nginx 재시작
```
(WSL cron 자동갱신은 WSL이 항상 켜져있지 않으면 안 도니 수동 권장.)

## ⚠ 아직 남은 것 (사용자 몫)
1. ~~정식 인증서~~ — ✅ 완료(Let's Encrypt). 90일마다 갱신만 챙기면 됨(위 "인증서 갱신").
2. **Google OAuth** — `~/pnug-stack/.env`의 `GOOGLE_CLIENT_ID/SECRET`가 비어있음 → 신청자 로그인 비활성(503). Cloud Console에서 발급 + redirect URI `https://arise-ai.pusan.ac.kr/auth/google/callback` 등록 + Authorized domain `pusan.ac.kr` 추가 후 채우고 재기동.
3. **시크릿 정리** — 최초 admin 로그인 후 `.env`의 `ADMIN_BOOTSTRAP_PASSWORD` 제거 권장.

## 자격증명 (deploy/.env = 서버 ~/pnug-stack/.env)
- admin 계정: `admin` / `SiBwlZc81BAV0TtB`  (최초 시드값 — 로그인 후 변경/제거 권장)
- PostgreSQL: `pnug` / `6k4P06iXKBHQwlarsoyWBJPA` (DB `pnug`)
- JWT_SECRET, GRAFANA_PW 등도 `.env` 참조. **이 파일은 git 커밋 금지.**

## 운영 명령 (서버에서)
```bash
cd ~/pnug-stack
docker compose ps                 # 상태
docker compose logs -f was        # 앱 로그
docker compose restart was        # 앱 재시작
docker compose down               # 중지 (DB 볼륨 pnug_pgdata는 보존)
docker compose up -d              # 기동
docker compose exec -T was node src/init-db.js   # 재시드(주의: 기존 응답 삭제)
```
DB 접속: `docker compose exec postgres psql -U pnug -d pnug`

## 코드 변경 후 재배포 (인터넷 되는 PC/WSL에서)
1. `~/pnug`(또는 레포)에서 `docker build --provenance=false -t pnug-was:latest .`
2. `docker save pnug-was:latest | gzip > images.tar.gz`
3. scp로 서버 반입 → `docker load -i images.tar.gz` → `cd ~/pnug-stack && docker compose up -d`
   (자동화 스크립트: `deploy/push-deploy.sh`, `deploy/server-install.sh` 참고)

## 파일 위치
- 서버: 스택 `~/pnug-stack/` · 번들/스크립트 `~/pnug-deploy/` · 소스 `~/pnu-grad/`
- 레포(Windows): `deploy/` 에 compose·Dockerfile·스크립트·self-signed 인증서(`certs/`)
