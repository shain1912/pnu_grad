@echo off
echo Stopping PNU-GRAD (ports 3001, 5173)...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3001,5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"
echo Done.
timeout /t 2 >nul
exit /b 0
