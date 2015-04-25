#Get the destination, or copy by default to release directory
DESTINATION=../../Binaries/Output/Release_Darwin/
if [ $# -ge 1 ]; then
	DESTINATION=$1
fi
SFML_LIB_DIR=../../ExtLibs/SFML/build-darwin/lib/
if [ $# -ge 2 ]; then
	SFML_LIB_DIR=$2
fi
SFML_BASE_DIR=../../ExtLibs/SFML
if [ $# -ge 3 ]; then
	SFML_BASE_DIR=$3
fi

if [ -d $SFML_LIB_DIR ]; then
	echo "Copying SFML files to '$DESTINATION'..."

	cp "$SFML_LIB_DIR"/*.dylib "$DESTINATION"/

else
	echo "SFML lib files not found in '$SFML_LIB_DIR', skipping it..."
fi

if [ -d $SFML_BASE_DIR ]; then
	echo "Copying SFML frameworks to '$DESTINATION/../Frameworks'..."

	cp -r "$SFML_BASE_DIR"/extlibs/libs-osx/Frameworks "$DESTINATION"/../

else
	echo "SFML base dir not found in '$SFML_BASE_DIR' (for frameworks), skipping it..."
fi

echo "Done."
