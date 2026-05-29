@echo off
chcp 65001 >nul
cd /d "%~dp0caddy"

echo ============================================================
echo  PNU-GRAD - Caddy 리버스 프록시 시작
echo ============================================================
echo.
echo  - 도메인: pnug.kodekorea.kr
echo  - 업스트림: http://localhost:3001 (백엔드 Express)
echo  - 인증서: Let's Encrypt 자동 발급 (첫 실행 시 80 포트로 challenge)
echo.
echo  사전 조건:
echo    1) caddy.exe 가 PATH 에 있거나, 이 폴더(caddy/)에 위치
echo    2) 공유기에서 WAN 80,443 -^> 이 PC LAN IP 로 포워딩됨
echo    3) Windows 방화벽 80,443 인바운드 허용
echo    4) DNS A 레코드: pnug.kodekorea.kr -^> 공인 IP
echo    5) backend 가 별도로 실행 중 (start-prod.bat 또는 수동)
echo ============================================================
echo.

where caddy >nul 2>nul
if errorlevel 1 (
  if exist caddy.exe (
    .\caddy.exe run
  ) else (
    echo [ERROR] caddy.exe 를 PATH 또는 이 폴더에서 찾을 수 없습니다.
    echo.
    echo 설치 방법 (둘 중 하나):
    echo   A) winget install caddyserver.caddy
    echo   B) https://github.com/caddyserver/caddy/releases 에서 windows_amd64.zip 다운로드,
    echo      caddy.exe 를 pnu-grad\caddy\ 폴더에 압축해제
    echo.
    pause
    exit /b 1
  )
) else (
  caddy run
)
