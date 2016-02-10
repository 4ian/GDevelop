@echo off
cd /d %~dp0

set destDir=%1
IF NOT DEFINED destDir set destDir="..\..\Binaries\Output\Release_Windows\CppPlatform"

echo Copying GDC++ and extensions to %destDir%...

::GDevelop C++ Platform, Core and extensions
xcopy ..\* "%destDir%\Sources\GDCpp\*" /S /Y /Q /D /E
xcopy ..\..\Core\* "%destDir%\Sources\Core\*" /S /Y /Q /D /E
xcopy ..\..\Extensions\* "%destDir%\Sources\Extensions\*" /S /Y /Q /D /E

::SFML headers
xcopy ..\..\ExtLibs\SFML\include\*.h "%destDir%\include\SFML\include\*.h" /S /Y /Q /D /E
xcopy ..\..\ExtLibs\SFML\include\*.hpp "%destDir%\include\SFML\include\*.hpp" /S /Y /Q /D /E
xcopy ..\..\ExtLibs\SFML\include\*.inl "%destDir%\include\SFML\include\*.inl" /S /Y /Q /D /E

IF EXIST "%destDir%\MinGW32\" goto :createPCH
::Copy the compiler used by GDevelop
echo Copying GCC compiler to CppPlatform/MinGW32...
set MINGW_DIR="C:\TDM-GCC-32"
IF NOT EXIST "%MINGW_DIR%" set MINGW_DIR="C:\MinGW32"
IF NOT EXIST "%MINGW_DIR%" set MINGW_DIR="C:\MinGW"

IF EXIST "%MINGW_DIR%" (
	xcopy "%MINGW_DIR%" "%destDir%\MinGW32\" /E /D /Q
	 ::Delete fat gdb.exe (+/-30mb)
	del "%destDir%\MinGW32\bin\gdb.exe"
	 ::Delete fat installer (+/-30mb)
	del "%destDir%\MinGW32\__installer\"*.exe
	echo Done - MinGW found in %MINGW_DIR%
) ELSE (
	echo MinGW not found!
)

::Create precompiled headers
:createPCH
IF NOT EXIST "%destDir%\MinGW32\bin\g++.exe" goto :end
echo Precompiling headers: GDCpp/EventsPrecompiledHeader.h.pch
"%destDir%\MinGW32\bin\g++.exe" -std=c++11 -DGD_API=__declspec(dllimport) -DGD_CORE_API=__declspec(dllimport) -D GD_EXTENSION_API=__declspec(dllimport) -DGD_IDE_ONLY -DDEV -DNDEBUG -I%destDir%\include/TDM-GCC-4.9.2/include  -I%destDir%\include/TDM-GCC-4.9.2/lib/gcc/mingw32/4.9.2/include -I%destDir%\include\TDM-GCC-4.9.2/lib/gcc/mingw32/4.9.2/include/c++ -I%destDir%\include\TDM-GCC-4.9.2/lib/gcc/mingw32/4.9.2/include/c++/mingw32 -I%destDir%\include/llvm/tools/clang/lib/Headers -I%destDir%\include/llvm/include -I%destDir%\include/llvm/build-tdmgcc49-release/include -I%destDir%\Sources/GDCpp -I%destDir%\Sources/Core -I%destDir%\include\SFML/include -x c++-header %destDir%\Sources/GDCpp/GDCpp/Runtime/EventsPrecompiledHeader.h -o %destDir%\Sources/GDCpp/GDCpp/Runtime/EventsPrecompiledHeader.h.pch

:end
echo Done.
