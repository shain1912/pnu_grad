@echo off
cd /d "%~dp0"

echo ============================================================
echo  PNU-GRAD - Development mode
echo ============================================================
echo.
echo  Backend  : http://localhost:3001
echo  Frontend : http://localhost:5173
echo.
echo  Index    : http://localhost:5173/
echo  Admin    : http://localhost:5173/admin/login
echo.
echo  Two cmd windows will open. Ctrl+C in each to stop.
echo ============================================================
echo.

start "PNU-GRAD Backend (3001)" cmd /k "cd /d %~dp0backend && npm run dev"
start "PNU-GRAD Frontend (5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 >nul
start "" "http://localhost:5173/"

exit /b 0
