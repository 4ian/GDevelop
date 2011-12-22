@echo off
echo.
echo Tool for updating include directory for Dev target.
echo Optional parameters : noPCH to skip headers precompilation.
echo Optional parameters : onlyPCH to do only headers precompilation.
if "%1"=="onlyPCH" GOTO PCH
echo.

echo -Copying files...
rem del ..\Bin\Release\include\*.* /S /Q

rem Standard library headers
xcopy C:\MinGW\lib\gcc\mingw32\4.5.2\include\*.* ..\Bin\Release\include\TDM-GCC-4.5.2\lib\gcc\mingw32\4.5.2\include\*.* /S  /Y /D
xcopy C:\MinGW\include\*.* ..\Bin\Release\include\TDM-GCC-4.5.2\include\*.* /S  /Y /D
xcopy ..\..\ExtLibs\llvm\tools\clang\lib\Headers\*.h ..\Bin\Release\include\llvm\tools\clang\lib\Headers\*.h /S  /Y /D

rem Game Develop C++ Implementation headers
xcopy ..\..\GDL\*.h ..\Bin\Release\include\GDL\*.h /S /Y /D

rem Boost (shared_ptr and dependencies) headers
..\..\ExtLibs\boost\bcp.exe --boost=..\..\ExtLibs\boost\ version config shared_ptr weak_ptr enable_shared_from_this ..\bin\release\include\boost\

rem SFML headers 
xcopy ..\..\ExtLibs\SFML\include\*.h ..\Bin\Release\include\SFML\include\*.h /S /Y /D
xcopy ..\..\ExtLibs\SFML\include\*.hpp ..\Bin\Release\include\SFML\include\*.hpp /S /Y /D
xcopy ..\..\ExtLibs\SFML\include\*.inl ..\Bin\Release\include\SFML\include\*.inl /S /Y /D

rem Extensions headers
xcopy ..\..\Extensions\*.h ..\Bin\Release\Extensions\include\*.h /S /Y /D
xcopy ..\..\Extensions\*.hpp ..\Bin\Release\Extensions\include\*.hpp /S /Y /D
xcopy ..\..\Extensions\*.inl ..\Bin\Release\Extensions\include\*.inl /S /Y /D

rem Extensions libs
xcopy ..\..\Extensions\*.a ..\Bin\Release\Extensions\Lib\*.a /S /Y /D

echo.
echo -End of copy
if NOT errorlevel 0 echo Some errors occurred.

echo.
:PCH
if "%1"=="noPCH" GOTO END
echo -Precompiling headers
..\..\ExtLibs\llvm\build-tdmgcc45-release\bin\clang.exe -fcxx-exceptions -fexceptions -fgnu-runtime -D GD_API=__declspec(dllimport) -D GD_EXTENSION_API=__declspec(dllimport) -DGD_IDE_ONLY -DRELEASE -DNDEBUG -DBOOST_DISABLE_ASSERTS -I..\Bin\Release\include/TDM-GCC-4.5.2/include  -I..\Bin\Release\include/TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include -I..\Bin\Release\include\TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++ -I..\Bin\Release\include\TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++/mingw32 -I..\Bin\Release\include/llvm/tools/clang/lib/Headers -I..\Bin\Release\include/llvm/include -I..\Bin\Release\include/llvm/build-tdmgcc45-release/include -I..\Bin\Release\include/GDL -I..\Bin\Release\include/boost -I..\Bin\Release\include\SFML/include -x c++-header --relocatable-pch  ..\Bin\Release\include\GDL\GDL\EventsCodePrecompiledHeader.h -o ..\Bin\Release\include\GDL\GDL\PrecompiledHeader.h.pch

..\..\ExtLibs\llvm\build-tdmgcc45-release\bin\clang.exe -fcxx-exceptions -fexceptions -fgnu-runtime -D GD_API=__declspec(dllimport) -D GD_EXTENSION_API=__declspec(dllimport) -DRELEASE -DNDEBUG  -DBOOST_DISABLE_ASSERTS -I..\Bin\Release\include/TDM-GCC-4.5.2/include  -I..\Bin\Release\include/TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include -I..\Bin\Release\include\TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++ -I..\Bin\Release\include\TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++/mingw32 -I..\Bin\Release\include/llvm/tools/clang/lib/Headers -I..\Bin\Release\include/llvm/include -I..\Bin\Release\include/llvm/build-tdmgcc45-release/include -I..\Bin\Release\include/GDL -I..\Bin\Release\include/boost -I..\Bin\Release\include\SFML/include -x c++-header --relocatable-pch  ..\Bin\Release\include\GDL\GDL\EventsCodePrecompiledHeader.h -o ..\Bin\Release\include\GDL\GDL\PrecompiledHeaderRuntime.h.pch

echo 

:END
echo -Done