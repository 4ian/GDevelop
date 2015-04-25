#!/bin/sh

#Get the destination, or copy by default to release directory
DESTINATION=../../Binaries/Output/Release_Linux/CppPlatform/
if [ ! $# -eq 0 ]; then
	DESTINATION=$1
fi

#Copy all js files
echo "Copying GDC++ and extensions header files (*.h) to '$DESTINATION'..."

mkdir -p "$DESTINATION"/include
mkdir -p "$DESTINATION"/include/GDCpp
mkdir -p "$DESTINATION"/include/Core
mkdir -p "$DESTINATION"/include/SFML/include
mkdir -p "$DESTINATION"/Extensions/include

rsync -r -u --include=*.h --include=*/ --exclude=* ../../GDCpp/  "$DESTINATION"/include/GDCpp/
rsync -r -u --include=*.h --include=*/ --exclude=* ../../Core/  "$DESTINATION"/include/Core/
rsync -r -u --include=*.h --include=*.hpp --include=*.inc --include=*.inl --include=*/ --exclude=* ../../ExtLibs/SFML/include/  "$DESTINATION"/include/SFML/include/
rsync -r -u --include=*.h --include=*.hpp --include=*.inc --include=*.inl --include=*/ --exclude=* ../../Extensions/  "$DESTINATION"/Extensions/include/

echo Done.