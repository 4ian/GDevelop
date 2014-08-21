
#Build
DIRECTORY="../Binaries/.build"
if [ ! -d "../Binaries/.build" ]; then
DIRECTORY="../Binaries/build"
fi
if [ -d "$DIRECTORY" ]; then
	cd "$DIRECTORY"
	if [ -f "build.ninha" ]; then
		ninja
	fi
	if [ -f "Makefile" ]; then
		make
	fi
else
	echo "Unable to find your build directory, just make sure that GD is compiled in Release_Linux"
fi
cd ../../GDCpp/scripts/
sh ./CopyHeadersToGD.sh
cd ../../scripts
sh CopyWindowsToLinuxReleaseFiles.sh
cd ../GDJS/scripts/
sh ./CopyRuntimeToGD.sh
cd ../../Binaries/Packaging
sh ./PackageForUbuntu.sh
