#Get the destination, or copy by default to release directory
DESTINATION=../../Binaries/Output/Release_Linux/
if [ ! $# -eq 0 ]; then
	DESTINATION=$1
fi
SFML_LIB_DIR=../../ExtLibs/SFML/build-linux/lib/

echo "Copying SFML files to '$DESTINATION'..."

cp "$SFML_LIB_DIR"/libsfml-audio.so.2.1 "$SFML_LIB_DIR"/libsfml-network.so.2.1 "$SFML_LIB_DIR"/libsfml-graphics.so.2.1 "$SFML_LIB_DIR"/libsfml-window.so.2.1 "$SFML_LIB_DIR"/libsfml-system.so.2.1 "$DESTINATION"/
mv "$DESTINATION"/libsfml-audio.so.2.1 "$DESTINATION"/libsfml-audio.so.2
mv "$DESTINATION"/libsfml-network.so.2.1 "$DESTINATION"/libsfml-network.so.2
mv "$DESTINATION"/libsfml-graphics.so.2.1 "$DESTINATION"/libsfml-graphics.so.2
mv "$DESTINATION"/libsfml-window.so.2.1 "$DESTINATION"/libsfml-window.so.2
mv "$DESTINATION"/libsfml-system.so.2.1 "$DESTINATION"/libsfml-system.so.2

echo "Done."
