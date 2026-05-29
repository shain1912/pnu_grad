@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================================
echo  PNU-GRAD - 학·석사 연계과정 신청 시스템
echo ============================================================
echo.
echo  Backend  : http://localhost:3001 (LAN 자동 노출)
echo  Frontend : http://localhost:5173 (LAN 자동 노출 - host:true)
echo.
echo  - 시안 인덱스 : http://localhost:5173/admission.html
echo  - 관리자 로그인 : http://localhost:5173/admin/login
echo.
echo  LAN에서 다른 PC/폰으로 접속하려면 두 가지 추가 작업이 필요합니다:
echo    1) Windows 방화벽 인바운드 허용 (포트 3001, 5173)
echo    2) backend/.env 의 GOOGLE_REDIRECT_URI / FRONTEND_URL 을
echo       LAN IP (예: http://192.168.x.x:3001/...) 로 수정 + Google
echo       Cloud Console 의 OAuth redirect URI 에 같은 LAN IP 추가
echo.
echo  두 개의 cmd 창이 새로 열립니다. 종료는 각 창에서 Ctrl+C.
echo ============================================================
echo.

start "PNU-GRAD Backend (3001)" cmd /k "chcp 65001 >nul && cd /d "%~dp0backend" && node --experimental-sqlite src/server.js"
start "PNU-GRAD Frontend (5173)" cmd /k "chcp 65001 >nul && cd /d "%~dp0frontend" && npm run dev"

timeout /t 3 >nul
start "" "http://localhost:5173/admission.html"

exit /b 0
