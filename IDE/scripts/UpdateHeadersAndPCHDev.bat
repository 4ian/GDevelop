@echo off
echo.
echo Tool for updating include directory for Dev target.
echo.
if "%1"=="PCHonly" GOTO PCH

echo -Copying files...
rem del ..\..\Binaries\Output\RelWithDebInfo_Windows\CppPlatform\include\*.* /S /Q

rem Game Develop C++ Implementation and Game Develop Core headers
xcopy ..\..\GDCpp\*.h ..\..\Binaries\Output\RelWithDebInfo_Windows\CppPlatform\include\GDCpp\*.h /S /Y /D
xcopy ..\..\Core\*.h ..\..\Binaries\Output\RelWithDebInfo_Windows\CppPlatform\include\Core\*.h /S /Y /D

rem Boost (shared_ptr and dependencies) headers
..\..\ExtLibs\boost\bcp.exe --boost=..\..\ExtLibs\boost\ version config shared_ptr weak_ptr enable_shared_from_this unordered mpl ..\..\Binaries\Output\RelWithDebInfo_Windows\CppPlatform\include\boost\

rem SFML headers
xcopy ..\..\ExtLibs\SFML\include\*.h ..\..\Binaries\Output\RelWithDebInfo_Windows\CppPlatform\include\SFML\include\*.h /S /Y /D
xcopy ..\..\ExtLibs\SFML\include\*.hpp ..\..\Binaries\Output\RelWithDebInfo_Windows\CppPlatform\include\SFML\include\*.hpp /S /Y /D
xcopy ..\..\ExtLibs\SFML\include\*.inl ..\..\Binaries\Output\RelWithDebInfo_Windows\CppPlatform\include\SFML\include\*.inl /S /Y /D

rem Extensions headers
xcopy ..\..\Extensions\*.h ..\..\Binaries\Output\RelWithDebInfo_Windows\CppPlatform\Extensions\include\*.h /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
xcopy ..\..\Extensions\*.hpp ..\..\Binaries\Output\RelWithDebInfo_Windows\CppPlatform\Extensions\include\*.hpp /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
xcopy ..\..\Extensions\*.inl ..\..\Binaries\Output\RelWithDebInfo_Windows\CppPlatform\Extensions\include\*.inl /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
rem AdvancedXML extension special case
xcopy ..\..\Extensions\AdvancedXml\src\*.h ..\..\Binaries\Output\RelWithDebInfo_Windows\CppPlatform\Extensions\include\AdvancedXml\*.h /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
xcopy ..\..\Extensions\AdvancedXml\src\*.hpp ..\..\Binaries\Output\RelWithDebInfo_Windows\CppPlatform\Extensions\include\AdvancedXml\*.hpp /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
xcopy ..\..\Extensions\AdvancedXml\src\*.inl ..\..\Binaries\Output\RelWithDebInfo_Windows\CppPlatform\Extensions\include\AdvancedXml\*.inl /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
rmdir ..\..\Binaries\Output\RelWithDebInfo_Windows\CppPlatform\Extensions\include\AdvancedXml\src /S /Q

rem Extensions libs
xcopy ..\..\Extensions\*.a ..\..\Binaries\Output\RelWithDebInfo_Windows\Extensions\Lib\*.a /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases

echo.
echo -End of copy
if NOT errorlevel 0 echo Some errors occurred.

echo.

:PCH
if "%1"=="noPCH" GOTO END
echo -Precompiling headers
..\bin\dev\CppPlatform\MinGW32\bin\g++.exe -DGD_API=__declspec(dllimport) -DGD_CORE_API=__declspec(dllimport) -D GD_EXTENSION_API=__declspec(dllimport) -DGD_IDE_ONLY -DDEV -DNDEBUG -DBOOST_DISABLE_ASSERTS -I..\..\Binaries\Output\RelWithDebInfo_Windows\CppPlatform\include/TDM-GCC-4.5.2/include  -I..\..\Binaries\Output\RelWithDebInfo_Windows\CppPlatform\include/TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include -I..\..\Binaries\Output\RelWithDebInfo_Windows\CppPlatform\include\TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++ -I..\..\Binaries\Output\RelWithDebInfo_Windows\CppPlatform\include\TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++/mingw32 -I..\..\Binaries\Output\RelWithDebInfo_Windows\CppPlatform\include/llvm/tools/clang/lib/Headers -I..\..\Binaries\Output\RelWithDebInfo_Windows\CppPlatform\include/llvm/include -I..\..\Binaries\Output\RelWithDebInfo_Windows\CppPlatform\include/llvm/build-tdmgcc45-release/include -I..\..\Binaries\Output\RelWithDebInfo_Windows\CppPlatform\include/GDCpp -I..\..\Binaries\Output\RelWithDebInfo_Windows\CppPlatform\include/Core -I..\..\Binaries\Output\RelWithDebInfo_Windows\CppPlatform\include/boost -I..\..\Binaries\Output\RelWithDebInfo_Windows\CppPlatform\include\SFML/include -x c++-header ..\..\Binaries\Output\RelWithDebInfo_Windows\CppPlatform\include/GDCpp/GDCpp/EventsPrecompiledHeader.h -o ..\..\Binaries\Output\RelWithDebInfo_Windows\CppPlatform\include/GDCpp/GDCpp/EventsPrecompiledHeader.h.pch

:END
echo 
echo -Done