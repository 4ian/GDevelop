::This script copies the runtimes files ( i.e: the javascript files located into the Runtime
::folder and in the Extensions folder ) to the Game Develop folder ( See below )

@echo off
set destDir="..\..\IDE\bin\dev\JsPlatform"
xcopy ..\Runtime\* %destDir%\Runtime\* /S /E  /D /Y
xcopy ..\..\Extensions\*.js %destDir%\Runtime\Extensions\*.js /S /E  /D /Y /EXCLUDE:FilesExcludedFromCopy
set destDir="..\..\IDE\bin\release\JsPlatform"
xcopy ..\Runtime\* %destDir%\Runtime\* /S /E  /D /Y
xcopy ..\..\Extensions\*.js %destDir%\Runtime\Extensions\*.js /S /E  /D /Y /EXCLUDE:FilesExcludedFromCopy
set destDir="..\..\IDE\bin\debug\JsPlatform"
xcopy ..\Runtime\* %destDir%\Runtime\* /S /E  /D /Y
xcopy ..\..\Extensions\*.js %destDir%\Runtime\Extensions\*.js /S /E  /D /Y /EXCLUDE:FilesExcludedFromCopy

::You may want to change this or add new similar lines to copy the runtime and the extensions
::to your Game Develop directory.
set destDir="C:\Users\Florian\AppData\Local\Temp\GDTemporaries\JSPreview"
xcopy ..\Runtime\*.js %destDir%\*.js /S /E  /D /Y
xcopy ..\..\Extensions\*.js %destDir%\Extensions\*.js /S /E  /D /Y /EXCLUDE:FilesExcludedFromCopy