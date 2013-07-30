@echo off
echo.
echo Tool for updating include directory for Debug target.
echo.

echo -Copying files...
rem del ..\..\Binaries\Output\Debug\CppPlatform\include\*.* /S /Q

rem Game Develop C++ Implementation headers
xcopy ..\..\GDCpp\*.h ..\..\Binaries\Output\Debug\CppPlatform\include\GDCpp\*.h /S /Y /D
xcopy ..\..\Core\*.h ..\..\Binaries\Output\Debug\CppPlatform\include\Core\*.h /S /Y /D

rem Boost (shared_ptr and dependencies) headers
..\..\ExtLibs\boost\bcp.exe --boost=..\..\ExtLibs\boost\ version config shared_ptr weak_ptr enable_shared_from_this unordered mpl ..\..\Binaries\Output\Debug\CppPlatform\include\boost\

rem SFML headers
xcopy ..\..\ExtLibs\SFML\include\*.h ..\..\Binaries\Output\Debug\CppPlatform\include\SFML\include\*.h /S /Y /D
xcopy ..\..\ExtLibs\SFML\include\*.hpp ..\..\Binaries\Output\Debug\CppPlatform\include\SFML\include\*.hpp /S /Y /D
xcopy ..\..\ExtLibs\SFML\include\*.inl ..\..\Binaries\Output\Debug\CppPlatform\include\SFML\include\*.inl /S /Y /D

rem Extensions headers
xcopy ..\..\Extensions\*.h ..\..\Binaries\Output\Debug\CppPlatform\Extensions\include\*.h /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
xcopy ..\..\Extensions\*.hpp ..\..\Binaries\Output\Debug\CppPlatform\Extensions\include\*.hpp /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
xcopy ..\..\Extensions\*.inl ..\..\Binaries\Output\Debug\CppPlatform\Extensions\include\*.inl /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
rem AdvancedXML extension special case
xcopy ..\..\Extensions\AdvancedXml\src\*.h ..\..\Binaries\Output\Debug\CppPlatform\Extensions\include\AdvancedXml\*.h /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
xcopy ..\..\Extensions\AdvancedXml\src\*.hpp ..\..\Binaries\Output\Debug\CppPlatform\Extensions\include\AdvancedXml\*.hpp /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
xcopy ..\..\Extensions\AdvancedXml\src\*.inl ..\..\Binaries\Output\Debug\CppPlatform\Extensions\include\AdvancedXml\*.inl /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
rmdir ..\..\Binaries\Output\Debug\CppPlatform\Extensions\include\AdvancedXml\src /S /Q

rem Extensions libs
xcopy ..\..\Extensions\*.a ..\..\Binaries\Output\Debug\Extensions\Lib\*.a /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases

echo.
echo -End of copy
if NOT errorlevel 0 echo Some errors occurred.

echo.
echo 

:END
echo -Done