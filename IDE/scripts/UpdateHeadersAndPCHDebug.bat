@echo off
echo.
echo Tool for updating include directory for Debug target.
echo.

echo -Copying files...
rem del ..\Bin\Debug\include\*.* /S /Q

rem Standard library headers
xcopy C:\MinGW\lib\gcc\mingw32\4.5.2\include\*.* ..\Bin\Debug\include\TDM-GCC-4.5.2\lib\gcc\mingw32\4.5.2\include\*.* /S  /Y /D
xcopy C:\MinGW\include\*.* ..\Bin\Debug\include\TDM-GCC-4.5.2\include\*.* /S  /Y /D
xcopy ..\..\ExtLibs\llvm\tools\clang\lib\Headers\*.h ..\Bin\Debug\include\llvm\tools\clang\lib\Headers\*.h /S  /Y /D

rem Game Develop C++ Implementation headers
xcopy ..\..\GDL\*.h ..\Bin\Debug\include\GDL\*.h /S /Y /D
xcopy ..\..\Core\*.h ..\Bin\Debug\include\Core\*.h /S /Y /D

rem Boost (shared_ptr and dependencies) headers
..\..\ExtLibs\boost\bcp.exe --boost=..\..\ExtLibs\boost\ version config shared_ptr weak_ptr enable_shared_from_this ..\bin\debug\include\boost\

rem SFML headers
xcopy ..\..\ExtLibs\SFML\include\*.h ..\Bin\Debug\include\SFML\include\*.h /S /Y /D
xcopy ..\..\ExtLibs\SFML\include\*.hpp ..\Bin\Debug\include\SFML\include\*.hpp /S /Y /D
xcopy ..\..\ExtLibs\SFML\include\*.inl ..\Bin\Debug\include\SFML\include\*.inl /S /Y /D

rem Extensions headers
xcopy ..\..\Extensions\*.h ..\Bin\Debug\Extensions\include\*.h /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
xcopy ..\..\Extensions\*.hpp ..\Bin\Debug\Extensions\include\*.hpp /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
xcopy ..\..\Extensions\*.inl ..\Bin\Debug\Extensions\include\*.inl /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases

rem Extensions libs
xcopy ..\..\Extensions\*.a ..\Bin\Debug\Extensions\Lib\*.a /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases

echo.
echo -End of copy
if NOT errorlevel 0 echo Some errors occurred.

echo.
echo 

:END
echo -Done