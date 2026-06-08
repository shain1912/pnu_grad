@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

:: --- 관리자 권한 자동 상승 (hosts 수정에 필요) ---
net session >nul 2>&1
if %errorlevel% neq 0 (
  echo 관리자 권한이 필요합니다. 권한 상승 중...
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)

set "HOSTS=%SystemRoot%\System32\drivers\etc\hosts"
set "TAG=PNUG-CLOSEDNET-SIM"

:menu
cls
echo ============================================================
echo  폐쇄망 흉내 - Google 도메인만 차단/복구 (hosts)
echo  대상: accounts.google.com / oauth2.googleapis.com
echo        www.googleapis.com / sheets.googleapis.com
echo ============================================================
findstr /C:"%TAG%" "%HOSTS%" >nul 2>&1
if !errorlevel! equ 0 (echo  현재 상태:  [ 차단됨 ON ]) else (echo  현재 상태:  [ 정상 OFF ])
echo.
echo    [1] 차단 ON   (폐쇄망 흉내 시작)
echo    [2] 차단 OFF  (원상 복구)
echo    [3] 연결 테스트 (4개 도메인 TCP443)
echo    [0] 종료
echo.
set /p sel="선택: "
if "%sel%"=="1" goto block
if "%sel%"=="2" goto unblock
if "%sel%"=="3" goto test
if "%sel%"=="0" exit /b
goto menu

:block
findstr /C:"%TAG%" "%HOSTS%" >nul 2>&1
if !errorlevel! equ 0 ( echo 이미 차단 상태입니다. & pause & goto menu )
>>"%HOSTS%" echo # %TAG%
>>"%HOSTS%" echo 0.0.0.0 accounts.google.com # %TAG%
>>"%HOSTS%" echo 0.0.0.0 oauth2.googleapis.com # %TAG%
>>"%HOSTS%" echo 0.0.0.0 www.googleapis.com # %TAG%
>>"%HOSTS%" echo 0.0.0.0 sheets.googleapis.com # %TAG%
ipconfig /flushdns >nul
echo.
echo [OK] 차단 적용됨. 이제 브라우저에서 사이트를 열어 확인하세요.
echo      - 페이지/폰트/GSAP = 정상,  Google 로그인 = 실패  => 폐쇄망과 동일
pause
goto menu

:unblock
findstr /V /C:"%TAG%" "%HOSTS%" > "%TEMP%\pnug_hosts.tmp"
copy /Y "%TEMP%\pnug_hosts.tmp" "%HOSTS%" >nul
del "%TEMP%\pnug_hosts.tmp" >nul 2>&1
ipconfig /flushdns >nul
echo.
echo [OK] 복구 완료 (차단 줄 제거).
pause
goto menu

:test
echo.
powershell -NoProfile -Command "'accounts.google.com','oauth2.googleapis.com','www.googleapis.com','sheets.googleapis.com' | ForEach-Object { $r = Test-NetConnection -ComputerName $_ -Port 443 -WarningAction SilentlyContinue; '    {0,-26} => {1}' -f $_, $(if($r.TcpTestSucceeded){'OK (열림)'}else{'BLOCKED (막힘)'}) }"
echo.
pause
goto menu
