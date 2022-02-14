@echo off
rem Script launching the generation of the documentations of all modules
rem Install globally doxgen before starting it.
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
cd GDJS
npm install
npm run generate-doc
IF NOT ERRORLEVEL 0 echo "Error during doc generation"
cd ..
cd scripts
