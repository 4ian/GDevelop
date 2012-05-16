@echo off
echo.
echo Tool for updating include directory for Dev target.
echo.

echo -Copying files...
rem del ..\Bin\Dev\include\*.* /S /Q

rem Standard library headers
xcopy C:\MinGW\lib\gcc\mingw32\4.5.2\include\*.* ..\Bin\Dev\include\TDM-GCC-4.5.2\lib\gcc\mingw32\4.5.2\include\*.* /S  /Y /D
xcopy C:\MinGW\include\*.* ..\Bin\Dev\include\TDM-GCC-4.5.2\include\*.* /S  /Y /D
xcopy ..\..\ExtLibs\llvm\tools\clang\lib\Headers\*.h ..\Bin\Dev\include\llvm\tools\clang\lib\Headers\*.h /S  /Y /D

rem Game Develop C++ Implementation and Game Develop Core headers
xcopy ..\..\GDL\*.h ..\Bin\Dev\include\GDL\*.h /S /Y /D
xcopy ..\..\Core\*.h ..\Bin\Dev\include\Core\*.h /S /Y /D

rem Boost (shared_ptr and dependencies) headers
..\..\ExtLibs\boost\bcp.exe --boost=..\..\ExtLibs\boost\ version config shared_ptr weak_ptr enable_shared_from_this ..\bin\dev\include\boost\

rem SFML headers 
xcopy ..\..\ExtLibs\SFML\include\*.h ..\Bin\Dev\include\SFML\include\*.h /S /Y /D
xcopy ..\..\ExtLibs\SFML\include\*.hpp ..\Bin\Dev\include\SFML\include\*.hpp /S /Y /D
xcopy ..\..\ExtLibs\SFML\include\*.inl ..\Bin\Dev\include\SFML\include\*.inl /S /Y /D

rem Extensions headers
xcopy ..\..\Extensions\*.h ..\Bin\Dev\Extensions\include\*.h /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
xcopy ..\..\Extensions\*.hpp ..\Bin\Dev\Extensions\include\*.hpp /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
xcopy ..\..\Extensions\*.inl ..\Bin\Dev\Extensions\include\*.inl /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
rem AdvancedXML extension special case
xcopy ..\..\Extensions\AdvancedXml\src\*.h ..\Bin\Dev\Extensions\include\AdvancedXml\*.h /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
xcopy ..\..\Extensions\AdvancedXml\src\*.hpp ..\Bin\Dev\Extensions\include\AdvancedXml\*.hpp /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
xcopy ..\..\Extensions\AdvancedXml\src\*.inl ..\Bin\Dev\Extensions\include\AdvancedXml\*.inl /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
rmdir ..\Bin\Dev\Extensions\include\AdvancedXml\src /S /Q

rem Extensions libs
xcopy ..\..\Extensions\*.a ..\Bin\Dev\Extensions\Lib\*.a /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases

echo.
echo -End of copy
if NOT errorlevel 0 echo Some errors occurred.

echo 

:END
echo -Done