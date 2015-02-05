#Launch this script to generate the .POT file used
#to update the strings to be translated.
echo "Listing all sources files..."

find ../IDE -name '*.cpp' | grep -v '/wxstedit/' > /tmp/listfile.txt
find ../IDE -name '*.h' -o -name "*.hpp" | grep -v '/wxstedit/' >> /tmp/listfile.txt
find ../GDCpp/GDCpp/ -name '*.cpp' >> /tmp/listfile.txt
find ../GDCpp/GDCpp/ -name '*.h' -o -name "*.hpp" >> /tmp/listfile.txt
find ../GDJS/GDJS/ -name '*.cpp' >> /tmp/listfile.txt
find ../GDJS/GDJS/ -name '*.h' -o -name "*.hpp" >> /tmp/listfile.txt
find ../Extensions/ -name '*.cpp' | grep -v '/TileMapObject/' >> /tmp/listfile.txt
find ../Extensions/ -name '*.h' -o -name "*.hpp" | grep -v '/TileMapObject/' >> /tmp/listfile.txt
find ../Core/GDCore -name '*.cpp' >> /tmp/listfile.txt
find ../Core/GDCore -name '*.h' -o -name "*.hpp" >> /tmp/listfile.txt

echo "Generating .POT file..."
xgettext --from-code iso-8859-1  -o source.pot --c++ --no-wrap -f /tmp/listfile.txt -k_

echo "source.pot file generated and ready to be sent to Crowdin or used in a translation software like PoEdit."
