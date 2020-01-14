#Script launching the generation of the documentations of all modules
#Install globally doxgen and jsdoc before starting it.
echo Generating all docs...
mkdir -p ../docs
mkdir -p logs
cd ..
cd Core/docs
doxygen
echo ℹ️ Generated Core docs
cd ../..
cd GDJS/docs
doxygen
echo ℹ️ Generated GDJS docs
cd ../..
cd GDCpp/docs
doxygen
echo ℹ️ Generated GDCpp docs
cd ../..
cd GDJS
npm install
jsdoc -c docs/jsdoc.conf.json -t docs/jaguarjs-jsdoc docs/DocMainPage.md
echo ℹ️ Generated GDJS Runtime docs
cd ..
cd scripts
