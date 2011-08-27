@echo off
echo Listing all sources files...

dir ..\*.cpp /L /b /s > %TEMP%\listfile.txt
dir ..\*.h /L /b /s >> %TEMP%\listfile.txt
dir ..\..\GDL\GDL\*.cpp /L /B /S >> %TEMP%\listfile.txt
dir ..\..\GDL\GDL\*.h /L /B /S >> %TEMP%\listfile.txt
dir ..\..\Extensions\*.cpp /L /B /S >> %TEMP%\listfile.txt
dir ..\..\Extensions\*.h /L /B /S >> %TEMP%\listfile.txt

echo Generating .POT file...
xgettext --from-code iso-8859-1  -o useMeToUpdateCatalogsWithPoEdit.pot --c++ --no-wrap -f %TEMP%\listfile.txt -k_

echo .POT file generated: Update now .po catalogs using poEdit ( Open .po catalog with PoEdit, and choose Catalog:Update from .POT file)