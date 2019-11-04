#Script launching the generation of the documentations of all modules
#Install globally doxgen and jsdoc before starting it.
echo Generating all docs...
mkdir -p ../docs
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
cd GDJS
jsdoc -c docs/jsdoc.conf.json -t docs/jaguarjs-jsdoc docs/DocMainPage.md
cd ..
cd scripts
