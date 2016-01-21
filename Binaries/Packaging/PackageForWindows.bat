@echo off > %TEMP%\#
md logs
setLocal EnableDelayedExpansion

echo Script for packaging GDevelop for Windows
echo.

::Try to find Inno Setup
set INNOSETUP_EXE=C:\Program Files (x86)\Inno Setup 5\ISCC.exe
IF NOT EXIST "%INNOSETUP_EXE%" set INNOSETUP_EXE=C:\Program Files\Inno Setup 5\ISCC.exe
IF EXIST "%INNOSETUP_EXE%" (
	echo "Note: InnoSetup found at %INNOSETUP_EXE%"
) ELSE (
	echo Warning: InnoSetup not found! Skipping installer creation.
	SET SKIPINSTALLER=1
)

echo Please ensure that locale directory is up to date with latest translations.
pause

echo Compiling Release target...
cd ..
IF EXIST "build" (
	cd build
	mingw32-make -j 4
	cd ..
) ELSE (
	echo Unable to find build directory, just make sure that GD is compiled inside Release_Windows
)

echo.
echo --Removing useless files...
del Output\Release_Windows\Examples\*.gdg.autosave > NUL 2> NUL
del Output\Release_Windows\log.txt > NUL 2> NUL

echo.
echo --Creating installer...
IF NOT "%SKIPINSTALLER%"=="1" "C:\Program Files (x86)\Inno Setup 5\ISCC.exe" Releases\InnoSetupInstallerScript.iss /Q
IF "%SKIPINSTALLER%"=="1" echo (Skipped)

echo.
echo --Creating archive...
if exist Releases\gd4xxxx.7z (del Releases\gd4xxxx.7z)
cd Output\Release_Windows\
IF NOT "%SKIPINSTALLERANDARCHIVE%"=="1" "..\..\..\ExtLibs\7za.exe" a ..\..\Releases\gd4xxxx.7z * > ..\..\Packaging\logs\7zArchiveLog.txt
IF "%SKIPINSTALLERANDARCHIVE%"=="1" echo (Skipped)
cd ..\..\..

echo. >CON
echo Finished. Do not forget to : >CON
echo -Update news.txt >CON
echo -Update pad file >CON
pause >CON
