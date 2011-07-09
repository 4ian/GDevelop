@echo off
echo.
echo Tool for updating Headers directory for Debug target.
echo Optional parameters : noPCH to skip headers precompilation.
echo.

echo -Copying files...
rem del ..\Bin\Debug\Headers\*.* /S /Q

rem Standard library headers
xcopy C:\TDM-GCC-4.5.2\lib\gcc\mingw32\4.5.2\include\*.h ..\Bin\Debug\Headers\TDM-GCC-4.5.2\lib\gcc\mingw32\4.5.2\include\*.h /S  /Y /D
xcopy c:\TDM-GCC-4.5.2\lib\gcc\mingw32\4.5.2\include\c++\*.h ..\Bin\Debug\Headers\TDM-GCC-4.5.2\lib\gcc\mingw32\4.5.2\include\c++\*.h /S  /Y /D
xcopy c:\TDM-GCC-4.5.2\lib\gcc\mingw32\4.5.2\include\c++\mingw32\*.h ..\Bin\Debug\Headers\TDM-GCC-4.5.2\lib\gcc\mingw32\4.5.2\include\c++\mingw32\*.h /S  /Y /D
xcopy ..\..\ExtLibs\llvm\tools\clang\lib\Headers\*.h ..\Bin\Debug\Headers\llvm\tools\clang\lib\Headers\*.h /S  /Y /D

rem Game Develop C++ Implementation headers
xcopy ..\..\GDL\*.h ..\Bin\Debug\Headers\GDL\*.h /S /Y /D

rem Boost (shared_ptr and dependencies) headers
xcopy ..\..\ExtLibs\boost\boost\*.hpp ..\Bin\Debug\Headers\boost\boost\*.hpp  /Y /S /D
xcopy ..\..\ExtLibs\boost\boost\*.h ..\Bin\Debug\Headers\boost\boost\*.h  /Y /S /D

rem SFML headers
xcopy ..\..\ExtLibs\SFML\include\*.h ..\Bin\Debug\Headers\SFML\include\*.h /S /Y /D
xcopy ..\..\ExtLibs\SFML\include\*.hpp ..\Bin\Debug\Headers\SFML\include\*.hpp /S /Y /D
xcopy ..\..\ExtLibs\SFML\include\*.inl ..\Bin\Debug\Headers\SFML\include\*.inl /S /Y /D

rem wxWidgets headers
xcopy ..\..\ExtLibs\wxwidgets\include\*.h ..\Bin\Debug\Headers\wxwidgets\include\*.h /S /Y /D
xcopy ..\..\ExtLibs\wxwidgets\include\*.hpp ..\Bin\Debug\Headers\wxwidgets\include\*.hpp /S /Y /D
xcopy ..\..\ExtLibs\wxwidgets\include\*.inl ..\Bin\Debug\Headers\wxwidgets\include\*.inl /S /Y /D

rem wxWidgets headers
xcopy ..\..\ExtLibs\wxwidgets\lib\*.h ..\Bin\Debug\Headers\wxwidgets\lib\*.h /S /Y /D
xcopy ..\..\ExtLibs\wxwidgets\lib\*.hpp ..\Bin\Debug\Headers\wxwidgets\lib\*.hpp /S /Y /D
xcopy ..\..\ExtLibs\wxwidgets\lib\*.inl ..\Bin\Debug\Headers\wxwidgets\lib\*.inl /S /Y /D

echo.
echo -End of copy
if NOT errorlevel 0 echo Some errors occurred.

echo.
if "%1"=="noPCH" GOTO END
echo -Precompiling headers
..\..\ExtLibs\llvm\build-tdmgcc45-release\bin\clang.exe -cc1 -fsyntax-only -disable-free -main-file-name RuntimePrecompiledHeader.h -mrelocation-model static -mdisable-fp-elim -mconstructor-aliases -momit-leaf-frame-pointer -resource-dir D:/Florian/Programmation/CGD_Compiler/bin/Release\\..\\lib\\clang\\3.0 -D GD_API=__declspec(dllimport) -DGD_IDE_ONLY -DDEV -DWINDOWS -D__WXMSW__ -D__GNUWIN32__ -DWXUSINGDLL -DwxDEBUG_LEVEL=0 -DNDEBUG -DwxUSE_UNICODE=0 -I C:/TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include -I ..\Bin\Debug\Headers\TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++ -I ..\Bin\Debug\Headers\TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++/mingw32 -I ..\..\ExtLibs/llvm/tools/clang/lib/Headers -I ..\../ExtLibs/llvm/include -I ..\../ExtLibs/llvm/build-tdmgcc45-release/include -I ..\../GDL -I ..\../ExtLibs/boost -I ..\../ExtLibs/SFML/include -I..\..\ExtLibs\wxwidgets\include -I..\..\ExtLibs\wxwidgets\lib\gcc_dll\msw -w -fdeprecated-macro -fno-dwarf2-cfi-asm -ferror-limit 19 -fmessage-length 80 -fcxx-exceptions -fexceptions -fno-use-cxa-atexit -fgnu-runtime -fdiagnostics-show-option -fcolor-diagnostics -x c++ RuntimePrecompiledHeader.h -emit-pch -o ..\Bin\Debug\Headers\GDL\GDL\RuntimePrecompiledHeader.h.pch

echo 

:END
echo -Done