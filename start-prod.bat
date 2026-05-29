@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================================
echo  PNU-GRAD - Production 모드 (도메인 노출용)
echo ============================================================
echo.
echo  사전 조건:
echo    1) backend/.env 의 NODE_ENV=production
echo    2) backend/.env 의 FRONTEND_URL, GOOGLE_REDIRECT_URI 가
echo       실제 도메인(예: https://pnug.kodekorea.kr) 으로 설정됨
echo    3) Google Cloud Console OAuth 클라이언트의 redirect URI 에
echo       해당 도메인이 등록됨
echo    4) HTTPS 종단(Cloudflare Tunnel / Nginx 등) 별도 실행 필요
echo.
echo  실행 순서:
echo    [1/2] frontend 빌드 (dist 생성)
echo    [2/2] backend 시작 (Express 가 dist 정적 서빙)
echo ============================================================
echo.

cd /d "%~dp0frontend"
call npm run build
if errorlevel 1 (
  echo.
  echo [ERROR] frontend 빌드 실패. 로그 확인.
  pause
  exit /b 1
)

echo.
echo [OK] dist 생성 완료. backend 시작.
echo.

cd /d "%~dp0backend"
node --experimental-sqlite src/server.js

pause
exit /b 0
