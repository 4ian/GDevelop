::This script copies the runtimes files (i.e: the javascript files located into the Runtime
::folder and in the Extensions folder) to the GDevelop folder.

@echo off
cd /d %~dp0

echo Copying GDJS and extensions runtime files (*.js) to output directory...
set destDir="..\..\Binaries\Output\RelWithDebInfo_Windows\JsPlatform"
xcopy ..\Runtime\* %destDir%\Runtime\* /S /E  /D /Y /Q
xcopy ..\..\Extensions\*.js %destDir%\Runtime\Extensions\*.js /S /E  /D /Y /Q /EXCLUDE:FilesExcludedFromCopy
set destDir="..\..\Binaries\Output\Release_Windows\JsPlatform"
xcopy ..\Runtime\* %destDir%\Runtime\* /S /E  /D /Y /Q
xcopy ..\..\Extensions\*.js %destDir%\Runtime\Extensions\*.js /S /E  /D /Y /Q /EXCLUDE:FilesExcludedFromCopy
set destDir="..\..\Binaries\Output\Debug_Windows\JsPlatform"
xcopy ..\Runtime\* %destDir%\Runtime\* /S /E  /D /Y /Q
xcopy ..\..\Extensions\*.js %destDir%\Runtime\Extensions\*.js /S /E  /D /Y /Q /EXCLUDE:FilesExcludedFromCopy

::You may want to change this or add new similar lines to copy the runtime and the extensions
::to your GDevelop directory.
set destDir="C:\Users\Florian\AppData\Local\Temp\GDTemporaries\JSPreview"
IF EXIST %destDir% (
	xcopy ..\Runtime\*.js %destDir%\*.js /S /E  /D /Y /Q
	xcopy ..\..\Extensions\*.js %destDir%\Extensions\*.js /S /E  /D /Y /EXCLUDE:FilesExcludedFromCopy /Q
)

echo Done.
