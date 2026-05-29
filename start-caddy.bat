@echo off
cd /d "%~dp0caddy"

echo ============================================================
echo  PNU-GRAD - Caddy reverse proxy
echo ============================================================
echo.
echo  Domain   pnug.kodekorea.kr
echo  Upstream http://localhost:3001
echo  Cert     Let's Encrypt auto
echo.
echo  Prerequisites
echo    1. caddy.exe in PATH or in this folder
echo    2. Router port-forward 80,443 to this PC LAN IP
echo    3. Windows firewall inbound 80,443 allowed
echo    4. DNS A record pnug.kodekorea.kr to public IP
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
