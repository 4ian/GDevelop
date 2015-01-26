::SFML
echo "Copying SFML files to " %1 "..."
echo xcopy "%2"\SFML\lib\*.dll "%1"\*.dll
xcopy "%2"\SFML\lib\*.dll "%1"\*.dll /D /Y /Q
xcopy "%2"\SFML\lib\*.a "%1"\*.a /D /Y /Q

::SFML dependencies
set SFML_DIR=../../ExtLibs/SFML
xcopy "%SFML_DIR%"\extlibs\bin\x86\*.dll "%1"\*.dll /D /Y /Q

::wxWidgets
echo "Copying wxWidgets files to " %1 "..."
set WX_LIB_DIR=../../ExtLibs/wxwidgets
xcopy "%WX_LIB_DIR%"\lib\gcc_dll\*.dll "%1"\*.dll /D /Y /Q
