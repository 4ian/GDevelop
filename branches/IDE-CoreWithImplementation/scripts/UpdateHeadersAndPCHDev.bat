@echo off
echo.
echo Tool for updating include directory for Dev target.
echo.
if "%1"=="PCHonly" GOTO PCH

echo -Copying files...
rem del ..\Bin\Dev\CppPlatform\include\*.* /S /Q

rem Game Develop C++ Implementation and Game Develop Core headers
xcopy ..\..\GDL\*.h ..\Bin\Dev\CppPlatform\include\GDL\*.h /S /Y /D
xcopy ..\..\Core\*.h ..\Bin\Dev\CppPlatform\include\Core\*.h /S /Y /D

rem Boost (shared_ptr and dependencies) headers
..\..\ExtLibs\boost\bcp.exe --boost=..\..\ExtLibs\boost\ version config shared_ptr weak_ptr enable_shared_from_this unordered mpl ..\bin\Dev\CppPlatform\include\boost\

rem SFML headers 
xcopy ..\..\ExtLibs\SFML\include\*.h ..\Bin\Dev\CppPlatform\include\SFML\include\*.h /S /Y /D
xcopy ..\..\ExtLibs\SFML\include\*.hpp ..\Bin\Dev\CppPlatform\include\SFML\include\*.hpp /S /Y /D
xcopy ..\..\ExtLibs\SFML\include\*.inl ..\Bin\Dev\CppPlatform\include\SFML\include\*.inl /S /Y /D

rem Extensions headers
xcopy ..\..\Extensions\*.h ..\Bin\Dev\CppPlatform\Extensions\include\*.h /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
xcopy ..\..\Extensions\*.hpp ..\Bin\Dev\CppPlatform\Extensions\include\*.hpp /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
xcopy ..\..\Extensions\*.inl ..\Bin\Dev\CppPlatform\Extensions\include\*.inl /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
rem AdvancedXML extension special case
xcopy ..\..\Extensions\AdvancedXml\src\*.h ..\Bin\Dev\CppPlatform\Extensions\include\AdvancedXml\*.h /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
xcopy ..\..\Extensions\AdvancedXml\src\*.hpp ..\Bin\Dev\CppPlatform\Extensions\include\AdvancedXml\*.hpp /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
xcopy ..\..\Extensions\AdvancedXml\src\*.inl ..\Bin\Dev\CppPlatform\Extensions\include\AdvancedXml\*.inl /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases
rmdir ..\Bin\Dev\CppPlatform\Extensions\include\AdvancedXml\src /S /Q

rem Extensions libs
xcopy ..\..\Extensions\*.a ..\Bin\Dev\Extensions\Lib\*.a /S /Y /D /EXCLUDE:HeadersUpdateSpecialCases

echo.
echo -End of copy
if NOT errorlevel 0 echo Some errors occurred.

echo.

:PCH
if "%1"=="noPCH" GOTO END
echo -Precompiling headers
..\bin\dev\CppPlatform\MinGW32\bin\g++.exe -DGD_API=__declspec(dllimport) -DGD_CORE_API=__declspec(dllimport) -D GD_EXTENSION_API=__declspec(dllimport) -DGD_IDE_ONLY -DDEV -DNDEBUG -DBOOST_DISABLE_ASSERTS -I..\Bin\Dev\CppPlatform\include/TDM-GCC-4.5.2/include  -I..\Bin\Dev\CppPlatform\include/TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include -I..\Bin\Dev\CppPlatform\include\TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++ -I..\Bin\Dev\CppPlatform\include\TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++/mingw32 -I..\Bin\Dev\CppPlatform\include/llvm/tools/clang/lib/Headers -I..\Bin\Dev\CppPlatform\include/llvm/include -I..\Bin\Dev\CppPlatform\include/llvm/build-tdmgcc45-release/include -I..\Bin\Dev\CppPlatform\include/GDL -I..\Bin\Dev\CppPlatform\include/Core -I..\Bin\Dev\CppPlatform\include/boost -I..\Bin\Dev\CppPlatform\include\SFML/include -x c++-header ..\Bin\Dev\CppPlatform\include/GDL/GDL/EventsPrecompiledHeader.h -o ..\Bin\Dev\CppPlatform\include/GDL/GDL/EventsPrecompiledHeader.h.pch

:END
echo 
echo -Done