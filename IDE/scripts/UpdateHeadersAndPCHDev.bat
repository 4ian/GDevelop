@echo off
echo.
echo Tool for updating Headers directory for Dev target.
echo Optional parameters : noPCH to skip headers precompilation.
echo.

echo -Copying files...
rem del ..\Bin\Dev\Headers\*.* /S /Q

rem Standard library headers
xcopy C:\TDM-GCC-4.5.2\lib\gcc\mingw32\4.5.2\include\*.h ..\Bin\Dev\Headers\TDM-GCC-4.5.2\lib\gcc\mingw32\4.5.2\include\*.h /S  /Y /D
xcopy c:\TDM-GCC-4.5.2\lib\gcc\mingw32\4.5.2\include\c++\*.h ..\Bin\Dev\Headers\TDM-GCC-4.5.2\lib\gcc\mingw32\4.5.2\include\c++\*.h /S  /Y /D
xcopy c:\TDM-GCC-4.5.2\lib\gcc\mingw32\4.5.2\include\c++\mingw32\*.h ..\Bin\Dev\Headers\TDM-GCC-4.5.2\lib\gcc\mingw32\4.5.2\include\c++\mingw32\*.h /S  /Y /D
xcopy ..\..\ExtLibs\llvm\tools\clang\lib\Headers\*.h ..\Bin\Dev\Headers\llvm\tools\clang\lib\Headers\*.h /S  /Y /D

rem Game Develop C++ Implementation headers
xcopy ..\..\GDL\*.h ..\Bin\Dev\Headers\GDL\*.h /S /Y /D

rem Boost (shared_ptr and dependencies) headers
xcopy ..\..\ExtLibs\boost\boost\*.hpp ..\Bin\Dev\Headers\boost\boost\*.hpp  /Y /S /D
xcopy ..\..\ExtLibs\boost\boost\*.h ..\Bin\Dev\Headers\boost\boost\*.h  /Y /S /D

rem SFML headers
xcopy ..\..\ExtLibs\SFML\include\*.h ..\Bin\Dev\Headers\SFML\include\*.h /S /Y /D
xcopy ..\..\ExtLibs\SFML\include\*.hpp ..\Bin\Dev\Headers\SFML\include\*.hpp /S /Y /D
xcopy ..\..\ExtLibs\SFML\include\*.inl ..\Bin\Dev\Headers\SFML\include\*.inl /S /Y /D

rem wxWidgets headers
xcopy ..\..\ExtLibs\wxwidgets\include\*.h ..\Bin\Dev\Headers\wxwidgets\include\*.h /S /Y /D
xcopy ..\..\ExtLibs\wxwidgets\include\*.hpp ..\Bin\Dev\Headers\wxwidgets\include\*.hpp /S /Y /D
xcopy ..\..\ExtLibs\wxwidgets\include\*.inl ..\Bin\Dev\Headers\wxwidgets\include\*.inl /S /Y /D

rem wxWidgets headers
xcopy ..\..\ExtLibs\wxwidgets\lib\*.h ..\Bin\Dev\Headers\wxwidgets\lib\*.h /S /Y /D
xcopy ..\..\ExtLibs\wxwidgets\lib\*.hpp ..\Bin\Dev\Headers\wxwidgets\lib\*.hpp /S /Y /D
xcopy ..\..\ExtLibs\wxwidgets\lib\*.inl ..\Bin\Dev\Headers\wxwidgets\lib\*.inl /S /Y /D

echo.
echo -End of copy
if NOT errorlevel 0 echo Some errors occurred.

echo.
if "%1"=="noPCH" GOTO END
echo -Precompiling headers
..\..\ExtLibs\llvm\build-tdmgcc45-release\bin\clang.exe -cc1 -fsyntax-only -disable-free -main-file-name RuntimePrecompiledHeader.h -mrelocation-model static -mdisable-fp-elim -mconstructor-aliases -momit-leaf-frame-pointer -resource-dir D:/Florian/Programmation/CGD_Compiler/bin/Release\\..\\lib\\clang\\3.0 -D GD_API=__declspec(dllimport) -DGD_IDE_ONLY -DDEV -DWINDOWS -D__WXMSW__ -D__GNUWIN32__ -DWXUSINGDLL -DwxDEBUG_LEVEL=0 -DNDEBUG -DwxUSE_UNICODE=0 -I C:/TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include -I ..\Bin\Dev\Headers\TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++ -I ..\Bin\Dev\Headers\TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++/mingw32 -I ..\..\ExtLibs/llvm/tools/clang/lib/Headers -I ..\../ExtLibs/llvm/include -I ..\../ExtLibs/llvm/build-tdmgcc45-release/include -I ..\../GDL -I ..\../ExtLibs/boost -I ..\../ExtLibs/SFML/include -I..\..\ExtLibs\wxwidgets\include -I..\..\ExtLibs\wxwidgets\lib\gcc_dll\msw -w -fdeprecated-macro -fno-dwarf2-cfi-asm -ferror-limit 19 -fmessage-length 80 -fcxx-exceptions -fexceptions -fno-use-cxa-atexit -fgnu-runtime -fdiagnostics-show-option -fcolor-diagnostics -x c++ RuntimePrecompiledHeader.h -emit-pch -o ..\Bin\Dev\Headers\GDL\GDL\RuntimePrecompiledHeader.h.pch

echo 

:END
echo -Done