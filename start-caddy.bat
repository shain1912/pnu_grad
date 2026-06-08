@echo off
cd /d "%~dp0caddy"

echo ============================================================
echo  PNU-GRAD - Caddy reverse proxy
echo ============================================================
echo.
echo  Domain   arise-ai.pusan.ac.kr
echo  Upstream http://localhost:3001
echo  Cert     issued SSL cert via Caddyfile tls directive (see DEPLOY.md section 4)
echo.
echo  Prerequisites
echo    1. caddy.exe in PATH or in this folder
echo    2. Caddyfile in this folder with: tls ^<crt^> ^<key^> + reverse_proxy localhost:3001
echo    3. Firewall inbound 443 (and 80 for redirect) allowed
echo    4. DNS A record arise-ai.pusan.ac.kr to server IP
echo    5. backend running in another terminal
echo ============================================================
echo.

where caddy >nul 2>nul
if not errorlevel 1 goto USE_PATH
if exist caddy.exe goto USE_LOCAL
goto NOT_FOUND

:USE_PATH
caddy run
goto END

:USE_LOCAL
.\caddy.exe run
goto END

:NOT_FOUND
echo [ERROR] caddy.exe not found.
echo.
echo Install options:
echo   A. winget install caddyserver.caddy
echo   B. Download from github.com/caddyserver/caddy/releases
echo      and put caddy.exe in pnu-grad\caddy\
echo.
pause
exit /b 1

:END
exit /b 0
