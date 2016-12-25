#Get the destination, or copy by default to release directory
DESTINATION=../../Binaries/Output/Release_Linux/
if [ $# -ge 1 ]; then
	DESTINATION=$1
fi
SFML_LIB_DIR=../../ExtLibs/SFML/build-linux/lib/
if [ $# -ge 2 ]; then
	SFML_LIB_DIR=$2
fi
WX_LIB_DIR=../../ExtLibs/wxWidgets/lib/
SYS_LIB_DIR1=/usr/lib/x86_64-linux-gnu/
SYS_LIB_DIR2=/lib/x86_64-linux-gnu/

if [ -d $SFML_LIB_DIR ]; then
	echo "Copying SFML files to '$DESTINATION'..."

	cp "$SFML_LIB_DIR"/libsfml-audio.so.2.4 "$SFML_LIB_DIR"/libsfml-network.so.2.4 "$SFML_LIB_DIR"/libsfml-graphics.so.2.4 "$SFML_LIB_DIR"/libsfml-window.so.2.4 "$SFML_LIB_DIR"/libsfml-system.so.2.4 "$DESTINATION"/
	#mv "$DESTINATION"/libsfml-audio.so.2.4 "$DESTINATION"/libsfml-audio.so.2
	#mv "$DESTINATION"/libsfml-network.so.2.4 "$DESTINATION"/libsfml-network.so.2
	#mv "$DESTINATION"/libsfml-graphics.so.2.4 "$DESTINATION"/libsfml-graphics.so.2
	#mv "$DESTINATION"/libsfml-window.so.2.4 "$DESTINATION"/libsfml-window.so.2
	#mv "$DESTINATION"/libsfml-system.so.2.4 "$DESTINATION"/libsfml-system.so.2
else
	echo "SFML lib files not found in '$SFML_LIB_DIR', skipping it..."
fi

copy_lib() {
	if [ -f "$SYS_LIB_DIR1"/$1 ]; then
		cp "$SYS_LIB_DIR1"/$1 "$DESTINATION"
	else
		if [ -f "$SYS_LIB_DIR2"/$1 ]; then
			cp "$SYS_LIB_DIR2"/$1 "$DESTINATION"
		else
			echo "$1 not found in '$SYS_LIB_DIR1' or '$SYS_LIB_DIR2', skipping it..."
		fi
	fi
}
if [ -d $SYS_LIB_DIR ]; then
	echo "Copying libraries (SFML dependencies) to '$DESTINATION'..."
	copy_lib "libfreetype.so.6"
	copy_lib "libudev.so.1"
	copy_lib "libFLAC.so.8"
	copy_lib "libGLEW.so.1.10"
	copy_lib "libopenal.so.1"
	copy_lib "libsndfile.so.1"
fi

if [ -d $WX_LIB_DIR ]; then
	echo "Copying wxWidgets files to '$DESTINATION'..."
	cp "$WX_LIB_DIR"/libwx_baseu-3.0.so.0.1.0 "$DESTINATION"/libwx_baseu-3.0.so.0
	cp "$WX_LIB_DIR"/libwx_baseu_net-3.0.so.0.1.0 "$DESTINATION"/libwx_baseu_net-3.0.so.0
	cp "$WX_LIB_DIR"/libwx_baseu_xml-3.0.so.0.1.0 "$DESTINATION"/libwx_baseu_xml-3.0.so.0
	cp "$WX_LIB_DIR"/libwx_gtk3u_adv-3.0.so.0.1.0 "$DESTINATION"/libwx_gtk3u_adv-3.0.so.0
	cp "$WX_LIB_DIR"/libwx_gtk3u_aui-3.0.so.0.1.0 "$DESTINATION"/libwx_gtk3u_aui-3.0.so.0
	cp "$WX_LIB_DIR"/libwx_gtk3u_core-3.0.so.0.1.0 "$DESTINATION"/libwx_gtk3u_core-3.0.so.0
	cp "$WX_LIB_DIR"/libwx_gtk3u_gl-3.0.so.0.1.0 "$DESTINATION"/libwx_gtk3u_gl-3.0.so.0
	cp "$WX_LIB_DIR"/libwx_gtk3u_html-3.0.so.0.1.0 "$DESTINATION"/libwx_gtk3u_html-3.0.so.0
	cp "$WX_LIB_DIR"/libwx_gtk3u_propgrid-3.0.so.0.1.0 "$DESTINATION"/libwx_gtk3u_propgrid-3.0.so.0
	cp "$WX_LIB_DIR"/libwx_gtk3u_qa-3.0.so.0.1.0 "$DESTINATION"/libwx_gtk3u_qa-3.0.so.0
	cp "$WX_LIB_DIR"/libwx_gtk3u_ribbon-3.0.so.0.1.0 "$DESTINATION"/libwx_gtk3u_ribbon-3.0.so.0
	cp "$WX_LIB_DIR"/libwx_gtk3u_richtext-3.0.so.0.1.0 "$DESTINATION"/libwx_gtk3u_richtext-3.0.so.0
	cp "$WX_LIB_DIR"/libwx_gtk3u_stc-3.0.so.0.1.0 "$DESTINATION"/libwx_gtk3u_stc-3.0.so.0
	cp "$WX_LIB_DIR"/libwx_gtk3u_webview-3.0.so.0.1.0 "$DESTINATION"/libwx_gtk3u_webview-3.0.so.0
	cp "$WX_LIB_DIR"/libwx_gtk3u_xrc-3.0.so.0.1.0 "$DESTINATION"/libwx_gtk3u_xrc-3.0.so.0
else
	echo "WxWidgets lib files not found in '$WX_LIB_DIR', skipping it... (This is ok if you're using system-provided wxWidgets)"
fi


echo "Done."
