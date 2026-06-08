@echo off
cd /d "%~dp0"

echo ============================================================
echo  PNU-GRAD - Build ^& Test (production-like)
echo ============================================================
echo.

echo [1/3] Check Google connectivity (closed network = BLOCKED is normal)
powershell -NoProfile -Command "'accounts.google.com','oauth2.googleapis.com','www.googleapis.com','sheets.googleapis.com' | ForEach-Object { $r = Test-NetConnection -ComputerName $_ -Port 443 -WarningAction SilentlyContinue; '    {0,-26} => {1}' -f $_, $(if($r.TcpTestSucceeded){'OK (open)'}else{'BLOCKED'}) }"
echo.

echo [2/3] Build frontend (creates frontend\dist, fonts bundled locally)
cd /d "%~dp0frontend"
call npm run build
if errorlevel 1 (
  echo.
  echo [ERROR] build failed - see log above
  pause
  exit /b 1
)
echo [OK] dist generated
echo.

echo [3/3] Start backend (prod) - Express serves dist
echo.
echo   Open in browser:  http://localhost:3001/
echo     - if pages/fonts/animations (GSAP) work, closed network is OK too
echo     - Google login is expected to fail if [1/3] shows BLOCKED
echo   Stop: Ctrl+C in this window
echo ============================================================
echo.

cd /d "%~dp0backend"
set NODE_ENV=production
node src/server.js

pause
exit /b 0
