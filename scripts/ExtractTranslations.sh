#Launch this script to generate the .POT file used
#to update the strings to be translated.
echo "ℹ️ Listing all GDCore, GDCpp, GDJS and Extensions sources files to translate..."

find ../GDJS/GDJS/ -name '*.cpp' | grep -v '/Dialogs/' > /tmp/listfile.txt
find ../GDJS/GDJS/ -name '*.h' -o -name "*.hpp" | grep -v '/Dialogs/' >> /tmp/listfile.txt
find ../Extensions/ -name '*.cpp' | grep -v '/Dialogs/' | grep -v '/AdvancedXML/' | grep -v '/Function/' | grep -v '/TimedEvent/' | grep -v '/PathBehavior/' | grep -v '/Light/' | grep -v '/TileMapObject/' | grep -v '/Box3DObject/' | grep -v '/AES/' | grep -v 'Editor.cpp' | grep -v 'Dialog.cpp' | grep -v 'EditorDlg.cpp' >> /tmp/listfile.txt
find ../Extensions/ -name '*.h' -o -name "*.hpp" | grep -v '/Dialogs/' | grep -v '/AdvancedXML/' | grep -v '/Function/' | grep -v '/TimedEvent/' | grep -v '/PathBehavior/' | grep -v '/Light/' | grep -v '/TileMapObject/' | grep -v '/Box3DObject/' | grep -v '/AES/' | grep -v 'Editor.cpp' | grep -v 'Dialog.cpp' | grep -v 'EditorDlg.cpp' >> /tmp/listfile.txt
find ../Extensions/ -name '*.js' | grep -v 'box2d.js' | grep -v '/bondage.js' >> /tmp/listfile.txt
find ../Core/GDCore -name '*.cpp' | grep -v '/Dialogs/' >> /tmp/listfile.txt
find ../Core/GDCore -name '*.h' -o -name "*.hpp" | grep -v '/Dialogs/' >> /tmp/listfile.txt

echo "ℹ️ Generating .POT file..."
if type xgettext 2>/dev/null; then
    GETTEXT=xgettext
else
	GETTEXT=$(find /usr -name "xgettext" -print -quit 2>/dev/null)
fi

if type $GETTEXT 2>/dev/null; then
	$GETTEXT --from-code utf-8  -o gdcore-gdcpp-gdjs-extensions-messages.pot --keyword=GD_T --no-wrap -f /tmp/listfile.txt -k_
	echo "ℹ️ Translation file 'gdcore-gdcpp-gdjs-extensions-messages.pot' generated and ready to be sent to Crowdin or used in a translation software like PoEdit."
else
	echo "❌ Unable to find xgettext on your system."
fi
