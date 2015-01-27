@echo off

::SFML
echo Copying SFML files to " %1 "...
echo xcopy "%2"\SFML\lib\*.dll "%1"\*.dll
xcopy "%2"\SFML\lib\*.dll "%1"\*.dll /D /Y /Q
xcopy "%2"\SFML\lib\*.a "%1"\*.a /D /Y /Q

::SFML dependencies
set SFML_DIR=../../ExtLibs/SFML
xcopy "%SFML_DIR%"\extlibs\bin\x86\*.dll "%1"\*.dll /D /Y /Q

::wxWidgets
echo Copying wxWidgets files to " %1 "...
set WX_LIB_DIR=../../ExtLibs/wxwidgets
xcopy "%WX_LIB_DIR%"\lib\gcc_dll\*.dll "%1"\*.dll /D /Y /Q

::MinGW
echo Copying MinGW dlls to "%1"...
set MINGW_DIR="%1"\CppPlatform\MinGW32

IF NOT EXIST "%MINGW_DIR%" set MINGW_DIR="C:\TDM-GCC-32"
IF NOT EXIST "%MINGW_DIR%" set MINGW_DIR="C:\MinGW32"
IF NOT EXIST "%MINGW_DIR%" set MINGW_DIR="C:\MinGW"

IF EXIST "%MINGW_DIR%" (
	xcopy %MINGW_DIR%\bin\libgcc_s_sjlj-1.dll "%1"\ /D /Y /Q
	xcopy %MINGW_DIR%\bin\libstdc++-6.dll "%1"\ /D /Y /Q
	echo Done - MinGW found in %MINGW_DIR%
) ELSE (
	echo MinGW not found!
)