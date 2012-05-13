@echo off
echo.
echo Tool for updating include directory for Dev target.
echo.

echo -Copying files...
rem del ..\Bin\Release\include\*.* /S /Q

rem Standard library headers
xcopy C:\MinGW\lib\gcc\mingw32\4.5.2\include\*.* ..\Bin\Release\include\TDM-GCC-4.5.2\lib\gcc\mingw32\4.5.2\include\*.* /S  /Y /D
xcopy C:\MinGW\include\*.* ..\Bin\Release\include\TDM-GCC-4.5.2\include\*.* /S  /Y /D
xcopy ..\..\ExtLibs\llvm\tools\clang\lib\Headers\*.h ..\Bin\Release\include\llvm\tools\clang\lib\Headers\*.h /S  /Y /D

rem Game Develop C++ Implementation headers
xcopy ..\..\GDL\*.h ..\Bin\Release\include\GDL\*.h /S /Y /D
xcopy ..\..\Core\*.h ..\Bin\Release\include\Core\*.h /S /Y /D

rem Boost (shared_ptr and dependencies) headers
..\..\ExtLibs\boost\bcp.exe --boost=..\..\ExtLibs\boost\ version config shared_ptr weak_ptr enable_shared_from_this ..\bin\release\include\boost\

rem SFML headers 
xcopy ..\..\ExtLibs\SFML\include\*.h ..\Bin\Release\include\SFML\include\*.h /S /Y /D
xcopy ..\..\ExtLibs\SFML\include\*.hpp ..\Bin\Release\include\SFML\include\*.hpp /S /Y /D
xcopy ..\..\ExtLibs\SFML\include\*.inl ..\Bin\Release\include\SFML\include\*.inl /S /Y /D

rem Extensions headers
xcopy ..\..\Extensions\*.h ..\Bin\Release\Extensions\include\*.h /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
xcopy ..\..\Extensions\*.hpp ..\Bin\Release\Extensions\include\*.hpp /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
xcopy ..\..\Extensions\*.inl ..\Bin\Release\Extensions\include\*.inl /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases

rem Special case : Widgets extension
xcopy ..\..\Extensions\Widgets-Extension\src\*.h ..\Bin\Release\Extensions\include\Widgets\*.h /S /Y /D

rem Extensions libs
xcopy ..\..\Extensions\*.a ..\Bin\Release\Extensions\Lib\*.a /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases

echo.
echo -End of copy
if NOT errorlevel 0 echo Some errors occurred.
echo.
echo 

:END
echo -Done