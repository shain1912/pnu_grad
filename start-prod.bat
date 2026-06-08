@echo off
cd /d "%~dp0"

echo ============================================================
echo  PNU-GRAD - Production mode
echo ============================================================
echo.
echo  Prerequisites:
echo    1) backend\.env  NODE_ENV=production
echo    2) backend\.env  FRONTEND_URL=https://arise-ai.pusan.ac.kr
echo    3) backend\.env  GOOGLE_REDIRECT_URI=https://arise-ai.pusan.ac.kr/auth/google/callback
echo    4) Google Cloud Console OAuth redirect URI registered
echo    5) HTTPS reverse-proxy running in another terminal (see DEPLOY.md section 4)
echo.
echo  Steps:
echo    [1/2] Build frontend (creates frontend\dist)
echo    [2/2] Start backend (Express serves dist)
echo ============================================================
echo.

cd /d "%~dp0frontend"
call npm run build
if errorlevel 1 (
  echo.
  echo [ERROR] frontend build failed. See log above.
  pause
  exit /b 1
)

echo.
echo [OK] dist generated. Starting backend...
echo.

cd /d "%~dp0backend"
node src/server.js

pause
exit /b 0
