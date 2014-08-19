@echo off
cd /d %~dp0

set destDir=%1
IF NOT DEFINED destDir set destDir="..\..\Binaries\Output\Release_Windows\CppPlatform"

echo Copying GDC++ and extensions header files (*.h) to %destDir%...

::Game Develop C++ Platform and Core headers
xcopy ..\*.h "%destDir%\include\GDCpp\*.h" /S /Y /Q /D /E
xcopy ..\..\Core\*.h "%destDir%\include\Core\*.h" /S /Y /Q /D /E

::Boost (shared_ptr and dependencies) headers
IF NOT EXIST %destDir%\include\boost\ (
	mkdir "%destDir%\include\boost\"
	bcp.exe --boost=..\..\ExtLibs\boost\ version config shared_ptr weak_ptr enable_shared_from_this unordered mpl %destDir%\include\boost\
)

::SFML headers
xcopy ..\..\ExtLibs\SFML\include\*.h "%destDir%\include\SFML\include\*.h" /S /Y /Q /D /E
xcopy ..\..\ExtLibs\SFML\include\*.hpp "%destDir%\include\SFML\include\*.hpp" /S /Y /Q /D /E
xcopy ..\..\ExtLibs\SFML\include\*.inl "%destDir%\include\SFML\include\*.inl" /S /Y /Q /D /E

::Extensions headers
xcopy ..\..\Extensions\*.h "%destDir%\Extensions\include\*.h" /S /Y /Q /D /E /EXCLUDE:HeadersUpdateSpecialCases
xcopy ..\..\Extensions\*.hpp "%destDir%\Extensions\include\*.hpp" /S /Y /Q /D /E /EXCLUDE:HeadersUpdateSpecialCases
xcopy ..\..\Extensions\*.inl "%destDir%\Extensions\include\*.inl" /S /Y /Q /D /E /EXCLUDE:HeadersUpdateSpecialCases

::Create precompiled headers
IF NOT EXIST "%destDir%\MinGW32\bin\g++.exe" goto :end
echo Precompiling headers: GDCpp/EventsPrecompiledHeader.h.pch
"%destDir%\MinGW32\bin\g++.exe" -DGD_API=__declspec(dllimport) -DGD_CORE_API=__declspec(dllimport) -D GD_EXTENSION_API=__declspec(dllimport) -DGD_IDE_ONLY -DDEV -DNDEBUG -DBOOST_DISABLE_ASSERTS -I%destDir%\include/TDM-GCC-4.5.2/include  -I%destDir%\include/TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include -I%destDir%\include\TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++ -I%destDir%\include\TDM-GCC-4.5.2/lib/gcc/mingw32/4.5.2/include/c++/mingw32 -I%destDir%\include/llvm/tools/clang/lib/Headers -I%destDir%\include/llvm/include -I%destDir%\include/llvm/build-tdmgcc45-release/include -I%destDir%\include/GDCpp -I%destDir%\include/Core -I%destDir%\include/boost -I%destDir%\include\SFML/include -x c++-header %destDir%\include/GDCpp/GDCpp/EventsPrecompiledHeader.h -o %destDir%\include/GDCpp/GDCpp/EventsPrecompiledHeader.h.pch

:end
echo Done.