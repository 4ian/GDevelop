#Launch this script to generate the .POT file used by PoEdit
#to update the strings to be translated.
echo "Listing all sources files..."

find .. -name '*.cpp' > /tmp/listfile.txt
find .. -name '*.h' -o -name "*.hpp" >> /tmp/listfile.txt
find ../../GDCpp/GDCpp/ -name '*.cpp' >> /tmp/listfile.txt
find ../../GDCpp/GDCpp/ -name '*.h' -o -name "*.hpp" >> /tmp/listfile.txt
find ../../GDJS/GDJS/ -name '*.cpp' >> /tmp/listfile.txt
find ../../GDJS/GDJS/ -name '*.h' -o -name "*.hpp" >> /tmp/listfile.txt
find ../../Extensions/ -name '*.cpp' | grep -v '/TileMapObject/' >> /tmp/listfile.txt
find ../../Extensions/ -name '*.h' -o -name "*.hpp" | grep -v '/TileMapObject/' >> /tmp/listfile.txt
find ../../Core/GDCore -name '*.cpp' >> /tmp/listfile.txt
find ../../Core/GDCore -name '*.h' -o -name "*.hpp" >> /tmp/listfile.txt

echo "Generating .POT file..."
xgettext --from-code iso-8859-1  -o useMeToUpdateCatalogsWithPoEdit.pot --c++ --no-wrap -f /tmp/listfile.txt -k_

echo ".POT file generated: Update now .po catalogs using poEdit (Open .po catalog with PoEdit, and choose Catalog:Update from .POT file)"
