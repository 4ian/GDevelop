#Get the destination, or copy by default to release directory
DESTINATION=../../Binaries/Output/Release_Darwin/
if [ $# -ge 1 ]; then
	DESTINATION=$1
fi
SFML_LIB_DIR=../../ExtLibs/SFML/build-darwin/lib/
if [ $# -ge 2 ]; then
	SFML_LIB_DIR=$2
fi

if [ -d $SFML_LIB_DIR ]; then
	echo "Copying SFML files to '$DESTINATION'..."

	cp "$SFML_LIB_DIR"/*.dylib "$DESTINATION"/
else
	echo "SFML lib files not found in '$SFML_LIB_DIR', skipping it..."
fi

echo "Done."
