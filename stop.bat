@echo off
chcp 65001 >nul
echo PNU-GRAD 서버 종료 (포트 3001, 5173)...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3001,5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"
echo 종료 완료.
timeout /t 2 >nul
exit /b 0
