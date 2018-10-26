::This script copies the runtimes files (i.e: the javascript files located into the Runtime
::folder and in the Extensions folder) to the GDevelop folder.

@echo off
cd /d %~dp0

set destDir=%1
if [%destDir%]==[] set destDir="..\..\Binaries\Output\Release_Windows\JsPlatform\Runtime"

echo Copying GDJS and extensions runtime files (*.js) to %destDir%...
xcopy "..\Runtime"\* %destDir%\* /S /E  /D /Y /Q
xcopy "..\..\Extensions"\*.js %destDir%\Extensions\*.js /S /E  /D /Y /Q /EXCLUDE:FilesExcludedFromCopy

echo ✅ Copied GDJS and extensions runtime files (*.js) to %destDir%.
