#Script launching the generation of the documentations of all modules
echo Generating all docs...
mkdir -p logs
cd ..
cd Core/docs
doxygen > ../../scripts/logs/CoreDoxygenLog.txt 2> ../../scripts/logs/CoreDoxygenWarningLog.txt
cd ../..
cd GDJS/docs
doxygen > ../../scripts/logs/GDJSDoxygenLog.txt  2> ../../scripts/logs/GDJSDoxygenWarningLog.txt
cd ../..
cd GDCpp/docs
doxygen > ../../scripts/logs/GDCppDoxygenLog.txt 2> ../../scripts/logs/GDCppDoxygenWarningLog.txt
cd ../..
cd GDJS/docs
yuidoc ../Runtime > ../../scripts/logs/GDJSYuidDocLog.txt  2> ../../scripts/logs/GDJSYuidDocWarningLog.txt
cd ../..
cd scripts
