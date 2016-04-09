#!/bin/sh

#Get the destination, or copy by default to release directory
DESTINATION=../../Binaries/Output/Release_Linux/CppPlatform/
if [ ! $# -eq 0 ]; then
	DESTINATION=$1
fi

#Copy all js files
echo "Copying GDC++ and extensions sources to '$DESTINATION'..."

mkdir -p "$DESTINATION"/Sources
mkdir -p "$DESTINATION"/Sources/GDCpp
mkdir -p "$DESTINATION"/Sources/Core
mkdir -p "$DESTINATION"/Sources/Extensions
mkdir -p "$DESTINATION"/include
mkdir -p "$DESTINATION"/include/SFML/include

rsync -r -u ../../GDCpp/  "$DESTINATION"/Sources/GDCpp/
rsync -r -u ../../Core/  "$DESTINATION"/Sources/Core/
rsync -r -u ../../Extensions/  "$DESTINATION"/Sources/Extensions/
rsync -r -u --include=*.h --include=*.hpp --include=*.inc --include=*.inl --include=*/ --exclude=* ../../ExtLibs/SFML/include/  "$DESTINATION"/include/SFML/include/

echo Done.
