@echo off
echo.
echo Tool for updating include directory for Dev target.
echo.

echo -Copying files...
rem del ..\Bin\Release\CppPlatform\include\*.* /S /Q

rem Game Develop C++ Implementation headers
xcopy ..\..\GDL\*.h ..\Bin\Release\CppPlatform\include\GDL\*.h /S /Y /D
xcopy ..\..\Core\*.h ..\Bin\Release\CppPlatform\include\Core\*.h /S /Y /D

rem Boost (shared_ptr and dependencies) headers
..\..\ExtLibs\boost\bcp.exe --boost=..\..\ExtLibs\boost\ version config shared_ptr weak_ptr enable_shared_from_this unordered mpl ..\bin\Release\CppPlatform\include\boost\

rem SFML headers 
xcopy ..\..\ExtLibs\SFML\include\*.h ..\Bin\Release\CppPlatform\include\SFML\include\*.h /S /Y /D
xcopy ..\..\ExtLibs\SFML\include\*.hpp ..\Bin\Release\CppPlatform\include\SFML\include\*.hpp /S /Y /D
xcopy ..\..\ExtLibs\SFML\include\*.inl ..\Bin\Release\CppPlatform\include\SFML\include\*.inl /S /Y /D

rem Extensions headers
xcopy ..\..\Extensions\*.h ..\Bin\Release\CppPlatform\Extensions\include\*.h /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
xcopy ..\..\Extensions\*.hpp ..\Bin\Release\CppPlatform\Extensions\include\*.hpp /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
xcopy ..\..\Extensions\*.inl ..\Bin\Release\CppPlatform\Extensions\include\*.inl /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
rem AdvancedXML extension special case
xcopy ..\..\Extensions\AdvancedXml\src\*.h ..\Bin\Release\CppPlatform\Extensions\include\AdvancedXml\*.h /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
xcopy ..\..\Extensions\AdvancedXml\src\*.hpp ..\Bin\Release\CppPlatform\Extensions\include\AdvancedXml\*.hpp /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
xcopy ..\..\Extensions\AdvancedXml\src\*.inl ..\Bin\Release\CppPlatform\Extensions\include\AdvancedXml\*.inl /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
rmdir ..\Bin\Release\CppPlatform\Extensions\include\AdvancedXml\src /S /Q

rem Special case : Widgets extension
rem xcopy ..\..\Extensions\Widgets-Extension\src\*.h ..\Bin\Release\CppPlatform\Extensions\include\Widgets\*.h /S /Y /D

echo.
echo -End of copy
if NOT errorlevel 0 echo Some errors occurred.
echo.
echo 

:END
echo -Done