@echo off
rem Script launching the generation of the documentations of all modules
echo Generating all docs...
cd ..
cd Core\docs
doxygen > ..\..\scripts\logs\CoreDoxygenLog.txt 2> ..\..\scripts\logs\CoreDoxygenWarningLog.txt
IF NOT ERRORLEVEL 0 echo "Error during doc generation"
cd ..\..
cd GDJS\docs
doxygen > ..\..\scripts\logs\GDJSDoxygenLog.txt  2> ..\..\scripts\logs\GDJSDoxygenWarningLog.txt
IF NOT ERRORLEVEL 0 echo "Error during doc generation"
cd ..\..
cd GDCpp\docs
doxygen > ..\..\scripts\logs\GDCppDoxygenLog.txt 2> ..\..\scripts\logs\GDCppDoxygenWarningLog.txt
IF NOT ERRORLEVEL 0 echo "Error during doc generation"
cd ..\..
cd GDJS\docs
yuidoc ../Runtime > ..\..\scripts\logs\GDJSYuidDocLog.txt  2> ..\..\scripts\logs\GDJSYuidDocWarningLog.txt
IF NOT ERRORLEVEL 0 echo "Error during doc generation"
cd ..\..
cd scripts