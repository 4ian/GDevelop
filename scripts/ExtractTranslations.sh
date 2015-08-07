#Launch this script to generate the .POT file used
#to update the strings to be translated.
echo "Listing all sources files..."

find ../IDE -name '*.cpp' | grep -v '/wxstedit/' > /tmp/listfile.txt
find ../IDE -name '*.h' -o -name "*.hpp" | grep -v '/wxstedit/' >> /tmp/listfile.txt
find ../GDCpp/GDCpp/ -name '*.cpp' >> /tmp/listfile.txt
find ../GDCpp/GDCpp/ -name '*.h' -o -name "*.hpp" >> /tmp/listfile.txt
find ../GDJS/GDJS/ -name '*.cpp' >> /tmp/listfile.txt
find ../GDJS/GDJS/ -name '*.h' -o -name "*.hpp" >> /tmp/listfile.txt
find ../Extensions/ -name '*.cpp' >> /tmp/listfile.txt
find ../Extensions/ -name '*.h' -o -name "*.hpp" >> /tmp/listfile.txt
find ../Core/GDCore -name '*.cpp' >> /tmp/listfile.txt
find ../Core/GDCore -name '*.h' -o -name "*.hpp" >> /tmp/listfile.txt

echo "Generating .POT file..."
if type xgettext 2>/dev/null; then
    GETTEXT=xgettext
else
	GETTEXT=$(find /**/* -name "xgettext" -print -quit 2>/dev/null)
fi

if type $GETTEXT 2>/dev/null; then
	$GETTEXT --from-code utf-8  -o source.pot --c++ --keyword=GD_T --no-wrap -f /tmp/listfile.txt -k_
	echo "source.pot file generated and ready to be sent to Crowdin or used in a translation software like PoEdit."
else
	echo "Unable to find xgettext on your system."
fi
