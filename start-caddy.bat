@echo off
cd /d "%~dp0caddy"

echo ============================================================
echo  PNU-GRAD - Caddy reverse proxy
echo ============================================================
echo.
echo  Domain   : pnug.kodekorea.kr
echo  Upstream : http://localhost:3001
echo  Cert     : Let's Encrypt (auto, requires port 80 reachable)
echo.
echo  Prerequisites:
echo    1) caddy.exe in PATH (winget) or in this folder
echo    2) Router port-forward: WAN 80,443 -^> this PC's LAN IP
echo    3) Windows firewall: inbound 80,443 allowed
echo    4) DNS A record: pnug.kodekorea.kr -^> public IP
echo    5) backend running (start-prod.bat in another terminal)
echo ============================================================
echo.

where caddy >nul 2>nul
if errorlevel 1 (
  if exist caddy.exe (
    .\caddy.exe run
  ) else (
    echo [ERROR] caddy.exe not found in PATH or in this folder.
    echo.
    echo Install (pick one):
    echo   A) winget install caddyserver.caddy
    echo   B) Download windows_amd64.zip from:
    echo      https://github.com/caddyserver/caddy/releases
    echo      Extract caddy.exe into pnu-grad\caddy\
    echo.
    pause
    exit /b 1
  )
) else (
  caddy run
)
