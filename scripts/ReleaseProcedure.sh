cd ../Binaries/.build
ninja
cd ../../IDE/scripts/
./UpdateHeadersAndPCHRelease.sh
cd ../../scripts
cd ../GDJS/scripts/
./CopyRuntimeToGD.sh
cd ../../Binaries/Packaging
./PackageForUbuntu.sh