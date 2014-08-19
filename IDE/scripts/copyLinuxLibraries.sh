#Get the destination, or copy by default to release directory
DESTINATION=../../Binaries/Output/Release_Linux/
if [ ! $# -eq 0 ]; then
	DESTINATION=$1
fi
SFML_LIB_DIR=../../ExtLibs/SFML/build-linux/lib/
WX_LIB_DIR=../../ExtLibs/wxWidgets/lib/

if [ -d $SFML_LIB_DIR ]; then
	echo "Copying SFML files to '$DESTINATION'..."

	cp "$SFML_LIB_DIR"/libsfml-audio.so.2.1 "$SFML_LIB_DIR"/libsfml-network.so.2.1 "$SFML_LIB_DIR"/libsfml-graphics.so.2.1 "$SFML_LIB_DIR"/libsfml-window.so.2.1 "$SFML_LIB_DIR"/libsfml-system.so.2.1 "$DESTINATION"/
	mv "$DESTINATION"/libsfml-audio.so.2.1 "$DESTINATION"/libsfml-audio.so.2
	mv "$DESTINATION"/libsfml-network.so.2.1 "$DESTINATION"/libsfml-network.so.2
	mv "$DESTINATION"/libsfml-graphics.so.2.1 "$DESTINATION"/libsfml-graphics.so.2
	mv "$DESTINATION"/libsfml-window.so.2.1 "$DESTINATION"/libsfml-window.so.2
	mv "$DESTINATION"/libsfml-system.so.2.1 "$DESTINATION"/libsfml-system.so.2
else
	echo "SFML lib files not found in '$SFML_LIB_DIR', skipping it..."
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
	echo "WxWidgets lib files not found in '$WX_LIB_DIR', skipping it..."
fi

echo "Done."
