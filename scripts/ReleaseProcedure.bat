@echo off > %TEMP%\#
cd ..
setLocal EnableDelayedExpansion

echo --Release procedure
echo.

echo --Is Runtime executable executing gam.egd and not another file?
choice /c:y

echo --Is res directory up to date?
choice /c:y

echo --Is locale directory up to date?
choice /c:y

echo --Generate installer and archive?
SET SKIPINSTALLERANDARCHIVE=0
choice /C:YN /T 10 /D Y
IF %ERRORLEVEL%==2 SET SKIPINSTALLERANDARCHIVE=1
IF %ERRORLEVEL%==1 SET SKIPINSTALLERANDARCHIVE=0

echo --Compiling Release target
cd Binaries/.build
ninja
cd ..\..

echo.
echo --Ensuring GDC++ headers and pch up-to-date for release
cd GDCpp/scripts
call CopyHeadersToGD.bat
cd ..\..

echo.
echo --Removing useless files...
del Binaries\Output\Release_Windows\Examples\*.gdg.autosave > NUL 2> NUL
del Binaries\Output\Release_Windows\log.txt > NUL 2> NUL

echo.
echo --Creating installer...
if exist Binaries\Releases\gd3xxxx.exe (del Binaries\Releases\gd3xxxx.exe)
IF NOT "%SKIPINSTALLERANDARCHIVE%"=="1" "C:\Program Files (x86)\Inno Setup 5\ISCC.exe" Binaries\Releases\InnoSetupInstallerScript.iss /Q
IF "%SKIPINSTALLERANDARCHIVE%"=="1" echo (Skipped)

echo.
echo --Creating archive...
if exist Binaries\Releases\gd3xxxx.7z (del Binaries\Releases\gd3xxxx.7z)
cd Binaries\Output\Release_Windows\
IF NOT "%SKIPINSTALLERANDARCHIVE%"=="1" "C:\Program Files (x86)\7-Zip\7z.exe" a ..\..\Releases\gd3xxxx.7z * > ..\..\..\scripts\logs\7zArchiveLog.txt
IF "%SKIPINSTALLERANDARCHIVE%"=="1" echo (Skipped)
cd ..\..\..

echo. >CON
echo Finished. Do not forget to : >CON
echo -Update news.txt >CON
echo -Update pad file >CON
pause >CON