@echo off
setlocal EnableDelayedExpansion

:: --- Auto elevate to admin (needed to edit hosts) ---
net session >nul 2>&1
if %errorlevel% neq 0 (
  echo Administrator rights required. Elevating...
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)

set "HOSTS=%SystemRoot%\System32\drivers\etc\hosts"
set "TAG=PNUG-CLOSEDNET-SIM"

:menu
cls
echo ============================================================
echo  Closed network simulation - block/restore Google domains
echo  Targets: accounts.google.com / oauth2.googleapis.com
echo           www.googleapis.com / sheets.googleapis.com
echo ============================================================
findstr /C:"%TAG%" "%HOSTS%" >nul 2>&1
if !errorlevel! equ 0 (echo  Current state:  [ BLOCKED ON ]) else (echo  Current state:  [ NORMAL OFF ])
echo.
echo    [1] Block ON   (start closed network sim)
echo    [2] Block OFF  (restore)
echo    [3] Connection test (4 domains TCP443)
echo    [0] Exit
echo.
set /p sel="Select: "
if "%sel%"=="1" goto block
if "%sel%"=="2" goto unblock
if "%sel%"=="3" goto test
if "%sel%"=="0" exit /b
goto menu

:block
findstr /C:"%TAG%" "%HOSTS%" >nul 2>&1
if !errorlevel! equ 0 ( echo Already blocked. & pause & goto menu )
>>"%HOSTS%" echo # %TAG%
>>"%HOSTS%" echo 0.0.0.0 accounts.google.com # %TAG%
>>"%HOSTS%" echo 0.0.0.0 oauth2.googleapis.com # %TAG%
>>"%HOSTS%" echo 0.0.0.0 www.googleapis.com # %TAG%
>>"%HOSTS%" echo 0.0.0.0 sheets.googleapis.com # %TAG%
ipconfig /flushdns >nul
echo.
echo [OK] Block applied. Open the site in a browser to verify.
echo      - pages/fonts/GSAP = OK, Google login = fail  =^> same as closed network
pause
goto menu

:unblock
findstr /V /C:"%TAG%" "%HOSTS%" > "%TEMP%\pnug_hosts.tmp"
copy /Y "%TEMP%\pnug_hosts.tmp" "%HOSTS%" >nul
del "%TEMP%\pnug_hosts.tmp" >nul 2>&1
ipconfig /flushdns >nul
echo.
echo [OK] Restored (block lines removed).
pause
goto menu

:test
echo.
powershell -NoProfile -Command "'accounts.google.com','oauth2.googleapis.com','www.googleapis.com','sheets.googleapis.com' | ForEach-Object { $r = Test-NetConnection -ComputerName $_ -Port 443 -WarningAction SilentlyContinue; '    {0,-26} => {1}' -f $_, $(if($r.TcpTestSucceeded){'OK (open)'}else{'BLOCKED'}) }"
echo.
pause
goto menu
