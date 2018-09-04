REM ===============================================================
REM This Windows batch script downloads Gdevelop from the master branch, builds the newIde and launches it.
REM
REM It still requires git, nodejs and electron to be installed.
REM If Gdevelop is already built, the script will simply launch it.
REM ===============================================================
echo This will clone, install, and launch GDevelop development version. Please make sure you have git and Node.js installed.

@echo off
SET fork=4ian

call git clone https://github.com/%fork%/GD.git
cd GD/newIDE/app
call npm install
cd ../electron-app
call npm install

cd ../app
start cmd /k npm start
cd ../electron-app
TIMEOUT /T 40
call node node_modules\electron\cli.js app
