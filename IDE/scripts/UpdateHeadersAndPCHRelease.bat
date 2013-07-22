@echo off
echo.
echo Tool for updating include directory for Release target.
echo.

echo -Copying files...
rem del ..\Bin\Release\CppPlatform\include\*.* /S /Q

rem Game Develop C++ Implementation headers
xcopy ..\..\GDCpp\*.h ..\Bin\Release\CppPlatform\include\GDCpp\*.h /S /Y /D
xcopy ..\..\Core\*.h ..\Bin\Release\CppPlatform\include\Core\*.h /S /Y /D

rem Boost (shared_ptr and dependencies) headers
rem ..\..\ExtLibs\boost\bcp.exe --boost=..\..\ExtLibs\boost\ version config shared_ptr weak_ptr enable_shared_from_this unordered mpl ..\bin\Release\CppPlatform\include\boost\

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
:PCH
if "%1"=="noPCH" GOTO END
echo -Precompiling headers
..\bin\Release\CppPlatform\MinGW32\bin\g++.exe -DGD_API=__declspec(dllimport) -DGD_CORE_API=__declspec(dllimport) -D GD_EXTENSION_API=__declspec(dllimport) -DGD_IDE_ONLY -DDEV -DNDEBUG -DBOOST_DISABLE_ASSERTS -I..\Bin\Release\CppPlatform\include/TDM-GCC-4.5.2/include  -I..\Bin\Release\CppPlatform\include/TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include -I..\Bin\Release\CppPlatform\include\TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++ -I..\Bin\Release\CppPlatform\include\TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++/mingw32 -I..\Bin\Release\CppPlatform\include/llvm/tools/clang/lib/Headers -I..\Bin\Release\CppPlatform\include/llvm/include -I..\Bin\Release\CppPlatform\include/llvm/build-tdmgcc45-release/include -I..\Bin\Release\CppPlatform\include/GDCpp -I..\Bin\Release\CppPlatform\include/Core -I..\Bin\Release\CppPlatform\include/boost -I..\Bin\Release\CppPlatform\include\SFML/include -x c++-header ..\Bin\Release\CppPlatform\include/GDCpp/GDCpp/EventsPrecompiledHeader.h -o ..\Bin\Release\CppPlatform\include/GDCpp/GDCpp/EventsPrecompiledHeader.h.pch
echo 

:END
echo -Done