@echo off
echo.
echo Tool for updating include directory for Debug target.
echo Optional parameters : noPCH to skip headers precompilation.
if "%1"=="onlyPCH" GOTO PCH
echo.

echo -Copying files...
rem del ..\Bin\Debug\include\*.* /S /Q

rem Standard library headers
xcopy C:\TDM-GCC-4.5.2\lib\gcc\mingw32\4.5.2\include\*.h ..\Bin\Debug\include\TDM-GCC-4.5.2\lib\gcc\mingw32\4.5.2\include\*.h /S  /Y /D
xcopy C:\TDM-GCC-4.5.2\include\*.* ..\Bin\Debug\include\TDM-GCC-4.5.2\include\*.* /S  /Y /D
xcopy ..\..\ExtLibs\llvm\tools\clang\lib\Headers\*.h ..\Bin\Debug\include\llvm\tools\clang\lib\Headers\*.h /S  /Y /D

rem Game Develop C++ Implementation headers
xcopy ..\..\GDL\*.h ..\Bin\Debug\include\GDL\*.h /S /Y /D

rem Boost (shared_ptr and dependencies) headers
..\..\ExtLibs\boost\bcp.exe --boost=..\..\ExtLibs\boost\ version config shared_ptr weak_ptr enable_shared_from_this ..\bin\debug\include\boost\

rem SFML headers
xcopy ..\..\ExtLibs\SFML\include\*.h ..\Bin\Debug\include\SFML\include\*.h /S /Y /D
xcopy ..\..\ExtLibs\SFML\include\*.hpp ..\Bin\Debug\include\SFML\include\*.hpp /S /Y /D
xcopy ..\..\ExtLibs\SFML\include\*.inl ..\Bin\Debug\include\SFML\include\*.inl /S /Y /D

rem Extensions headers
xcopy ..\..\Extensions\*.h ..\Bin\Debug\Extensions\include\*.h /S /Y /D
xcopy ..\..\Extensions\*.hpp ..\Bin\Debug\Extensions\include\*.hpp /S /Y /D
xcopy ..\..\Extensions\*.inl ..\Bin\Debug\Extensions\include\*.inl /S /Y /D

rem Extensions libs
xcopy ..\..\Extensions\*.a ..\Bin\Debug\Extensions\Lib\*.a /S /Y /D

echo.
echo -End of copy
if NOT errorlevel 0 echo Some errors occurred.

echo.
:PCH
if "%1"=="noPCH" GOTO END
echo -Precompiling headers
..\..\ExtLibs\llvm\build-tdmgcc45-release\bin\clang.exe  -mdisable-fp-elim -mconstructor-aliases -momit-leaf-frame-pointer -fdeprecated-macro -fno-dwarf2-cfi-asm -fcxx-exceptions -fexceptions -fno-use-cxa-atexit -fgnu-runtime -fdiagnostics-show-option -fcolor-diagnostics -D GD_API=__declspec(dllimport) -D GD_EXTENSION_API=__declspec(dllimport) -DGD_IDE_ONLY -DDEBUG -I..\Bin\Debug\include/TDM-GCC-4.5.2/include  -I..\Bin\Debug\include/TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include -I..\Bin\Debug\include\TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++ -I..\Bin\Debug\include\TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++/mingw32 -I..\Bin\Debug\include/llvm/tools/clang/lib/Headers -I..\Bin\Debug\include/llvm/include -I..\Bin\Debug\include/llvm/build-tdmgcc45-release/include -I..\Bin\Debug\include/GDL -I..\Bin\Debug\include/boost -I..\Bin\Debug\include\SFML/include -x c++-header --relocatable-pch  ..\Bin\Debug\include\GDL\GDL\EventsCodePrecompiledHeader.h -o ..\Bin\Debug\include\GDL\GDL\PrecompiledHeader.h.pch

..\..\ExtLibs\llvm\build-tdmgcc45-release\bin\clang.exe  -mdisable-fp-elim -mconstructor-aliases -momit-leaf-frame-pointer -fdeprecated-macro -fno-dwarf2-cfi-asm -fcxx-exceptions -fexceptions -fno-use-cxa-atexit -fgnu-runtime -fdiagnostics-show-option -fcolor-diagnostics -D GD_API=__declspec(dllimport) -D GD_EXTENSION_API=__declspec(dllimport) -DDEBUG -I..\Bin\Debug\include/TDM-GCC-4.5.2/include  -I..\Bin\Debug\include/TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include -I..\Bin\Debug\include\TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++ -I..\Bin\Debug\include\TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++/mingw32 -I..\Bin\Debug\include/llvm/tools/clang/lib/Headers -I..\Bin\Debug\include/llvm/include -I..\Bin\Debug\include/llvm/build-tdmgcc45-release/include -I..\Bin\Debug\include/GDL -I..\Bin\Debug\include/boost -I..\Bin\Debug\include\SFML/include -x c++-header --relocatable-pch  ..\Bin\Debug\include\GDL\GDL\EventsCodePrecompiledHeader.h -o ..\Bin\Debug\include\GDL\GDL\PrecompiledHeaderRuntime.h.pch

echo 

:END
echo -Done