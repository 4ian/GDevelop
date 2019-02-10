@echo off
echo This will try to automatically run the gdevelop electron app!
where node.exe >nul 2>&1 && goto NodeInstalled || goto NodePortable

REM cd GDevelop/scripts/

:NodePortable
ECHO NPM is not installed. I will try to run it from portable path...
REM Set below values in case you are running a portable version of node (from flash thumb) 
SET localNodePath=D:\stuff\node\
SET npmParams=--scripts-prepend-node-path
GOTO runApp

:NodeInstalled
ECHO NPM is already installed
SET localNodePath=
SET npmParams=
GOTO runApp

:runApp
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" Taskkill /IM node.exe /F

cd ../newIDE/app
call %localNodePath%npm run flow %npmParams%
pause
GOTO End