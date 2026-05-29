# Caddy 셋업 — pnug.kodekorea.kr

## 1. Caddy 설치 (택일)
```cmd
:: A) winget (권장)
winget install caddyserver.caddy

:: B) 수동 다운로드
:: https://github.com/caddyserver/caddy/releases 의 windows_amd64.zip 받아서
:: caddy.exe 를 이 폴더(pnu-grad/caddy/) 에 압축해제
```

## 2. 공유기 포트포워딩
공유기 관리 페이지(보통 192.168.0.1 또는 192.168.1.1) → 포트포워딩:
- 외부 **80** → 이 PC LAN IP **80** (HTTP-01 challenge용, HTTPS 강제 redirect용)
- 외부 **443** → 이 PC LAN IP **443** (HTTPS 본 트래픽)

## 3. Windows 방화벽
PowerShell **관리자 권한**:
```powershell
New-NetFirewallRule -DisplayName "Caddy HTTP"  -Direction Inbound -Protocol TCP -LocalPort 80  -Action Allow
New-NetFirewallRule -DisplayName "Caddy HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

## 4. DNS A 레코드
`kodekorea.kr` 네임서버 관리 화면에서:
- 호스트(이름): `pnug`
- 타입: `A`
- 값: 공인 IP (확인: https://whatismyipaddress.com)

⚠ **공인 IP가 동적**이면 DDNS 필요. 무료: [DuckDNS](https://www.duckdns.org)
- DuckDNS 같은 거 쓰면 `pnug.kodekorea.kr` 의 CNAME을 `xxx.duckdns.org` 로
- DuckDNS의 IP가 자동 갱신됨

## 5. 실행 순서
1. 백엔드 먼저: `start-prod.bat` (frontend 빌드 + Express 3001)
2. Caddy: `start-caddy.bat` (또는 이 폴더에서 `caddy run`)
3. 브라우저로 https://pnug.kodekorea.kr 접속 → 인증서 자동 발급 확인

## 6. PC 재부팅 시 자동 시작 (선택)
Caddy를 Windows 서비스로 등록하려면 [nssm](https://nssm.cc):
```cmd
nssm install caddy "C:\path\to\caddy.exe" "run --config C:\Users\user\pnu-grad\caddy\Caddyfile"
nssm start caddy
```
백엔드도 같은 방식으로 nssm 서비스 등록 가능.

## 7. 인증서 발급 안 되면
첫 실행 시 Caddy 로그(콘솔 또는 access.log) 확인:
- `acme: error... 80포트 접근 불가` → 공유기 80 포워딩 + 방화벽 확인
- `dns... NXDOMAIN` → DNS A 레코드 미반영 (전파에 5분~수시간)
- `rate limited` → Let's Encrypt 발급 한도 초과 (1주 5번) — 잠시 대기

테스트: `nslookup pnug.kodekorea.kr` 로 공인 IP가 나와야 함.
