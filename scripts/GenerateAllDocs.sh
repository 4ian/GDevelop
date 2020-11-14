# Script launching the generation of the documentations of all modules
# Install globally doxgen before starting it.
set -e

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
npm run generate-doc
echo ℹ️ Generated GDJS Runtime docs
cd ..
cd scripts
