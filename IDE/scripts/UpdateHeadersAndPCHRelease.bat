@echo off
echo.
echo Tool for updating include directory for Release target.
echo.

echo -Copying files...
rem del ..\..\Binaries\Output\Release\CppPlatform\include\*.* /S /Q

rem Game Develop C++ Implementation headers
xcopy ..\..\GDCpp\*.h ..\..\Binaries\Output\Release\CppPlatform\include\GDCpp\*.h /S /Y /D
xcopy ..\..\Core\*.h ..\..\Binaries\Output\Release\CppPlatform\include\Core\*.h /S /Y /D

rem Boost (shared_ptr and dependencies) headers
..\..\ExtLibs\boost\bcp.exe --boost=..\..\ExtLibs\boost\ version config shared_ptr weak_ptr enable_shared_from_this unordered mpl ..\..\Binaries\Output\Release\CppPlatform\include\boost\

rem SFML headers 
xcopy ..\..\ExtLibs\SFML\include\*.h ..\..\Binaries\Output\Release\CppPlatform\include\SFML\include\*.h /S /Y /D
xcopy ..\..\ExtLibs\SFML\include\*.hpp ..\..\Binaries\Output\Release\CppPlatform\include\SFML\include\*.hpp /S /Y /D
xcopy ..\..\ExtLibs\SFML\include\*.inl ..\..\Binaries\Output\Release\CppPlatform\include\SFML\include\*.inl /S /Y /D

rem Extensions headers
xcopy ..\..\Extensions\*.h ..\..\Binaries\Output\Release\CppPlatform\Extensions\include\*.h /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
xcopy ..\..\Extensions\*.hpp ..\..\Binaries\Output\Release\CppPlatform\Extensions\include\*.hpp /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
xcopy ..\..\Extensions\*.inl ..\..\Binaries\Output\Release\CppPlatform\Extensions\include\*.inl /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
rem AdvancedXML extension special case
xcopy ..\..\Extensions\AdvancedXml\src\*.h ..\..\Binaries\Output\Release\CppPlatform\Extensions\include\AdvancedXml\*.h /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
xcopy ..\..\Extensions\AdvancedXml\src\*.hpp ..\..\Binaries\Output\Release\CppPlatform\Extensions\include\AdvancedXml\*.hpp /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
xcopy ..\..\Extensions\AdvancedXml\src\*.inl ..\..\Binaries\Output\Release\CppPlatform\Extensions\include\AdvancedXml\*.inl /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
rmdir ..\..\Binaries\Output\Release\CppPlatform\Extensions\include\AdvancedXml\src /S /Q

rem Special case : Widgets extension
rem xcopy ..\..\Extensions\Widgets-Extension\src\*.h ..\..\Binaries\Output\Release\CppPlatform\Extensions\include\Widgets\*.h /S /Y /D

echo.
echo -End of copy
if NOT errorlevel 0 echo Some errors occurred.
echo.
:PCH
if "%1"=="noPCH" GOTO END
echo -Precompiling headers
..\..\Binaries\Output\Release\CppPlatform\MinGW32\bin\g++.exe -DGD_API=__declspec(dllimport) -DGD_CORE_API=__declspec(dllimport) -D GD_EXTENSION_API=__declspec(dllimport) -DGD_IDE_ONLY -DDEV -DNDEBUG -DBOOST_DISABLE_ASSERTS -I..\..\Binaries\Output\Release\CppPlatform\include/TDM-GCC-4.5.2/include  -I..\..\Binaries\Output\Release\CppPlatform\include/TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include -I..\..\Binaries\Output\Release\CppPlatform\include\TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++ -I..\..\Binaries\Output\Release\CppPlatform\include\TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++/mingw32 -I..\..\Binaries\Output\Release\CppPlatform\include/llvm/tools/clang/lib/Headers -I..\..\Binaries\Output\Release\CppPlatform\include/llvm/include -I..\..\Binaries\Output\Release\CppPlatform\include/llvm/build-tdmgcc45-release/include -I..\..\Binaries\Output\Release\CppPlatform\include/GDCpp -I..\..\Binaries\Output\Release\CppPlatform\include/Core -I..\..\Binaries\Output\Release\CppPlatform\include/boost -I..\..\Binaries\Output\Release\CppPlatform\include\SFML/include -x c++-header ..\..\Binaries\Output\Release\CppPlatform\include/GDCpp/GDCpp/EventsPrecompiledHeader.h -o ..\..\Binaries\Output\Release\CppPlatform\include/GDCpp/GDCpp/EventsPrecompiledHeader.h.pch
echo 

:END
echo -Done