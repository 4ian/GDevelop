::This script copies the runtimes files ( i.e: the javascript files located into the Runtime
::folder ) to the Game Develop folder ( See below )
@echo off
set destDir="..\..\IDE\bin\dev\JsPlatform"

xcopy ..\Runtime\* %destDir%\Runtime\* /S /E  /D /Y

set destDir="C:\Users\Florian\AppData\Local\Temp\GDTemporaries\JSPreview"

xcopy ..\Runtime\* %destDir%\Runtime\* /S /E  /D /Y