@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================================
echo  PNU-GRAD - 빌드 ^& 테스트 (배포 환경 흉내)
echo ============================================================
echo.

echo [1/3] Google 연결 상태 점검 (폐쇄망이면 BLOCKED 로 나와야 정상)
powershell -NoProfile -Command "'accounts.google.com','oauth2.googleapis.com','www.googleapis.com','sheets.googleapis.com' | ForEach-Object { $r = Test-NetConnection -ComputerName $_ -Port 443 -WarningAction SilentlyContinue; '    {0,-26} => {1}' -f $_, $(if($r.TcpTestSucceeded){'OK (열림)'}else{'BLOCKED (막힘)'}) }"
echo.

echo [2/3] 프론트엔드 빌드 (frontend\dist 생성, 폰트도 로컬 번들)
cd /d "%~dp0frontend"
call npm run build
if errorlevel 1 (
  echo.
  echo [ERROR] 빌드 실패 - 위 로그 확인
  pause
  exit /b 1
)
echo [OK] dist 생성 완료
echo.

echo [3/3] 백엔드(prod) 시작 - Express 가 dist 정적 서빙
echo.
echo   ▶ 브라우저에서 열기:  http://localhost:3001/
echo     - 페이지/폰트/애니메이션(GSAP)이 정상이면 폐쇄망에서도 OK
echo     - Google 로그인은 위 [1/3] 이 BLOCKED 면 실패하는 게 정상
echo   ▶ 종료: 이 창에서 Ctrl+C
echo ============================================================
echo.

cd /d "%~dp0backend"
set NODE_ENV=production
node src/server.js

pause
exit /b 0
