#Get the destination, or copy by default to release directory
DESTINATION=../../Binaries/Output/Release_Linux/
if [ $# -ge 1 ]; then
	DESTINATION=$1
fi

rm_lib() {
	if [ -f "$DESTINATION"/$1 ]; then
		rm "$DESTINATION"/$1
	fi
}

rm_lib "libfreetype.so.6"
rm_lib "libudev.so.1"
rm_lib "libFLAC.so.8"
rm_lib "libGLEW.so.1.10"
rm_lib "libopenal.so.1"
rm_lib "libsndfile.so.1"
