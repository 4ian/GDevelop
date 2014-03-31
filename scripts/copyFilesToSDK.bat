@echo off
echo.
echo -Copying all needed files to GDSDK...

mkdir ..\GDSDK > nul
mkdir ..\GDSDK\Binaries > nul
mkdir ..\GDSDK\Binaries\Output > nul
mkdir ..\GDSDK\Binaries\Output\Release > nul
mkdir ..\GDSDK\ExtLibs > nul
mkdir ..\Runtime\bin\release > nul
xcopy ..\ExtLibs\Readme.txt ..\GDSDK\ExtLibs\ /Y > nul

echo -Copying all needed files to GDSDK... ( GDCpp )
xcopy ..\GDCpp\*.h ..\GDSDK\GDCpp\*.h /S /Y  > nul
xcopy ..\GDCpp\*.hpp ..\GDSDK\GDCpp\*.hpp /S /Y  > nul
xcopy ..\GDCpp\*.hh ..\GDSDK\GDCpp\*.hh /S /Y  > nul
xcopy ..\GDCpp\GDCpp\tinyxml.cpp ..\GDSDK\GDCpp\GDCpp\tinyxml.cpp /S /Y  > nul
xcopy ..\GDCpp\GDCpp\tinystr.cpp ..\GDSDK\GDCpp\GDCpp\tinystr.cpp /S /Y  > nul
xcopy ..\GDCpp\GDCpp\tinyxmlerror.cpp ..\GDSDK\GDCpp\GDCpp\tinyxmlerror.cpp /S /Y  > nul
xcopy ..\GDCpp\GDCpp\tinyxmlparser.cpp ..\GDSDK\GDCpp\GDCpp\tinyxmlparser.cpp /S /Y  > nul
xcopy ..\GDCpp\doc\* ..\GDSDK\GDCpp\doc\ /S /Y  > nul

echo -Copying all needed files to GDSDK... ( Core )
xcopy ..\Core\*.h ..\GDSDK\Core\*.h /S /Y  /EXCLUDE:FilesExcludedFromCopy   > nul
xcopy ..\Core\*.hpp ..\GDSDK\Core\*.hpp /S /Y  /EXCLUDE:FilesExcludedFromCopy   > nul
xcopy ..\Core\*.hh ..\GDSDK\Core\*.hh /S /Y  /EXCLUDE:FilesExcludedFromCopy   > nul
xcopy ..\Core\doc\* ..\GDSDK\Core\doc\* /S /Y   > nul

echo -Copying all needed files to GDSDK... ( GDCpp and GDCore binaries )

xcopy ..\Binaries\Output\Release\CppPlatform\Runtime\*.* ..\GDSDK\Binaries\Output\Release\CppPlatform\Runtime\ /Y 

xcopy ..\Binaries\Output\Release\libGDCpp.dll.a ..\GDSDK\Binaries\Output\Release\ /Y 
xcopy ..\Binaries\Output\Release\GDCpp.dll ..\GDSDK\Binaries\Output\Release\ /Y 
xcopy ..\Binaries\Output\Release\libGDCore.dll.a ..\GDSDK\Binaries\Output\Release\ /Y 
xcopy ..\Binaries\Output\Release\GDCore.dll ..\GDSDK\Binaries\Output\Release\ /Y 