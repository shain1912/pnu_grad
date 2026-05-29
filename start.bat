@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================================
echo  PNU-GRAD - 학·석사 연계과정 신청 시스템
echo ============================================================
echo.
echo  Backend  : http://localhost:3001
echo  Frontend : http://localhost:5173
echo.
echo  - 시안 인덱스 : http://localhost:5173/admission.html
echo  - 관리자 로그인 : http://localhost:5173/admin/login
echo.
echo  두 개의 cmd 창이 새로 열립니다. 종료는 각 창에서 Ctrl+C.
echo ============================================================
echo.

start "PNU-GRAD Backend (3001)" cmd /k "chcp 65001 >nul && cd /d "%~dp0backend" && node --experimental-sqlite src/server.js"
start "PNU-GRAD Frontend (5173)" cmd /k "chcp 65001 >nul && cd /d "%~dp0frontend" && npm run dev"

timeout /t 3 >nul
start "" "http://localhost:5173/admission.html"

exit /b 0
