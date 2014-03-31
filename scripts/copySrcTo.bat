@echo off
echo.
echo Tool for copying all source files to a directory
echo.
echo -Select destination :
echo ( Press enter to use D:\Florian\Machines virtuelles\Dossier Partage )
set destDir=""
set /p destDir=
if %destDir%=="" (set destDir="D:\Florian\Machines virtuelles\Dossier Partage")

echo.
echo -Clear destination before copying? 
echo ( Type anything to clear destination, Press enter to copy without clearing )
set erase=""
set /p erase=
if NOT %erase%=="" (if exist %destDir%\GameDevelop2 rmdir %destDir%\GameDevelop2 /S /Q)
if NOT %erase%=="" mkdir %destDir%\GameDevelop2

echo -Copy files...
xcopy ..\* %destDir%\GameDevelop2\* /S /E /EXCLUDE:FilesExcludedFromCopy /D /Y

echo.
echo -End of copy
if NOT errorlevel 0 echo Some errors occurred.