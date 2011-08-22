@echo off
echo.
echo Tool for updating include directory for Dev target.
echo Optional parameters : noPCH to skip headers precompilation.
echo Optional parameters : onlyPCH to do only headers precompilation.
if "%1"=="onlyPCH" GOTO PCH
echo.

echo -Copying files...
rem del ..\Bin\Dev\include\*.* /S /Q

rem Standard library headers
xcopy C:\TDM-GCC-4.5.2\lib\gcc\mingw32\4.5.2\include\*.* ..\Bin\Dev\include\TDM-GCC-4.5.2\lib\gcc\mingw32\4.5.2\include\*.* /S  /Y /D
xcopy C:\TDM-GCC-4.5.2\include\*.* ..\Bin\Dev\include\TDM-GCC-4.5.2\include\*.* /S  /Y /D
xcopy ..\..\ExtLibs\llvm\tools\clang\lib\Headers\*.h ..\Bin\Dev\include\llvm\tools\clang\lib\Headers\*.h /S  /Y /D

rem Game Develop C++ Implementation headers
xcopy ..\..\GDL\*.h ..\Bin\Dev\include\GDL\*.h /S /Y /D

rem Boost (shared_ptr and dependencies) headers
xcopy ..\..\ExtLibs\boost\boost\*.hpp ..\Bin\Dev\include\boost\boost\*.hpp  /Y /S /D
xcopy ..\..\ExtLibs\boost\boost\*.h ..\Bin\Dev\include\boost\boost\*.h  /Y /S /D

rem SFML headers 
xcopy ..\..\ExtLibs\SFML\include\*.h ..\Bin\Dev\include\SFML\include\*.h /S /Y /D
xcopy ..\..\ExtLibs\SFML\include\*.hpp ..\Bin\Dev\include\SFML\include\*.hpp /S /Y /D
xcopy ..\..\ExtLibs\SFML\include\*.inl ..\Bin\Dev\include\SFML\include\*.inl /S /Y /D

rem wxWidgets headers
xcopy ..\..\ExtLibs\wxwidgets\include\*.h ..\Bin\Dev\include\wxwidgets\include\*.h /S /Y /D
xcopy ..\..\ExtLibs\wxwidgets\include\*.hpp ..\Bin\Dev\include\wxwidgets\include\*.hpp /S /Y /D
xcopy ..\..\ExtLibs\wxwidgets\include\*.inl ..\Bin\Dev\include\wxwidgets\include\*.inl /S /Y /D

rem wxWidgets headers
xcopy ..\..\ExtLibs\wxwidgets\lib\*.h ..\Bin\Dev\include\wxwidgets\lib\*.h /S /Y /D
xcopy ..\..\ExtLibs\wxwidgets\lib\*.hpp ..\Bin\Dev\include\wxwidgets\lib\*.hpp /S /Y /D
xcopy ..\..\ExtLibs\wxwidgets\lib\*.inl ..\Bin\Dev\include\wxwidgets\lib\*.inl /S /Y /D

rem Extensions headers
xcopy ..\..\Extensions\*.h ..\Bin\Dev\Extensions\include\*.h /S /Y /D
xcopy ..\..\Extensions\*.hpp ..\Bin\Dev\Extensions\include\*.hpp /S /Y /D
xcopy ..\..\Extensions\*.inl ..\Bin\Dev\Extensions\include\*.inl /S /Y /D

rem Extensions libs
xcopy ..\..\Extensions\*.a ..\Bin\Dev\Extensions\Lib\*.a /S /Y /D

echo.
echo -End of copy
if NOT errorlevel 0 echo Some errors occurred.

echo.
:PCH
if "%1"=="noPCH" GOTO END
echo -Precompiling headers
..\..\ExtLibs\llvm\build-tdmgcc45-release\bin\clang.exe  -mdisable-fp-elim -mconstructor-aliases -momit-leaf-frame-pointer -fdeprecated-macro -fno-dwarf2-cfi-asm -fcxx-exceptions -fexceptions -fno-use-cxa-atexit -fgnu-runtime -fdiagnostics-show-option -fcolor-diagnostics -D GD_API=__declspec(dllimport) -D GD_EXTENSION_API=__declspec(dllimport) -DGD_IDE_ONLY -DDEV -DNDEBUG -DBOOST_DISABLE_ASSERTS -I..\Bin\Dev\include/TDM-GCC-4.5.2/include  -I..\Bin\Dev\include/TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include -I..\Bin\Dev\include\TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++ -I..\Bin\Dev\include\TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++/mingw32 -I..\Bin\Dev\include/llvm/tools/clang/lib/Headers -I..\Bin\Dev\include/llvm/include -I..\Bin\Dev\include/llvm/build-tdmgcc45-release/include -I..\Bin\Dev\include/GDL -I..\Bin\Dev\include/boost -I..\Bin\Dev\include\SFML/include -x c++-header --relocatable-pch  ..\Bin\Dev\include\GDL\GDL\EventsCodePrecompiledHeader.h -o ..\Bin\Dev\include\GDL\GDL\PrecompiledHeader.h.pch

..\..\ExtLibs\llvm\build-tdmgcc45-release\bin\clang.exe  -mdisable-fp-elim -mconstructor-aliases -momit-leaf-frame-pointer -fdeprecated-macro -fno-dwarf2-cfi-asm -fcxx-exceptions -fexceptions -fno-use-cxa-atexit -fgnu-runtime -fdiagnostics-show-option -fcolor-diagnostics -D GD_API=__declspec(dllimport) -D GD_EXTENSION_API=__declspec(dllimport) -DDEV -DNDEBUG  -DBOOST_DISABLE_ASSERTS -I..\Bin\Dev\include/TDM-GCC-4.5.2/include  -I..\Bin\Dev\include/TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include -I..\Bin\Dev\include\TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++ -I..\Bin\Dev\include\TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++/mingw32 -I..\Bin\Dev\include/llvm/tools/clang/lib/Headers -I..\Bin\Dev\include/llvm/include -I..\Bin\Dev\include/llvm/build-tdmgcc45-release/include -I..\Bin\Dev\include/GDL -I..\Bin\Dev\include/boost -I..\Bin\Dev\include\SFML/include -x c++-header --relocatable-pch  ..\Bin\Dev\include\GDL\GDL\EventsCodePrecompiledHeader.h -o ..\Bin\Dev\include\GDL\GDL\PrecompiledHeaderRuntime.h.pch

echo 

:END
echo -Done