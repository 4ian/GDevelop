@echo off

REM ===============================================================
REM This Windows batch script downloads GDevelop from the master branch, builds the newIde and launches it.
REM
REM It still requires git, nodejs and electron to be installed.
REM If GDevelop is already built, the script will simply launch it.
REM ===============================================================
echo This will clone, install, and launch GDevelop development version. Please make sure you have git and Node.js installed.

SET fork=4ian
SET project=GDevelop

IF exist %project%/newIDE/electron-app/node_modules (
	echo /newIDE/electron-app/node_modules already exists. Skipping "npm install..."
	cd %project%/newIDE/app
	GOTO runElectronApp
)

ELSE (
	call git clone https://github.com/%fork%/%project%.git
	cd %project%/newIDE/app
	call npm install
	cd ../electron-app
	call npm install
	cd ../app
	GOTO runElectronApp
)

:runElectronApp
	start cmd /k npm start
	cd ../electron-app
	TIMEOUT /T 60
	call node node_modules\electron\cli.js app
goto:eof

