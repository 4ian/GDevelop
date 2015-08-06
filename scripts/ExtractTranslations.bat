@echo off
echo Listing all sources files...

dir ..\IDE\*.cpp /L /b /s  |find /v /i "\wxstedit\"  > %TEMP%\listfile.txt
dir ..\IDE\*.h /L /b /s  |find /v /i "\wxstedit\"  >> %TEMP%\listfile.txt
dir ..\GDCpp\GDCpp\*.cpp /L /B /S >> %TEMP%\listfile.txt
dir ..\GDCpp\GDCpp\*.h /L /B /S >> %TEMP%\listfile.txt
dir ..\GDJS\GDJS\*.cpp /L /B /S >> %TEMP%\listfile.txt
dir ..\GDJS\GDJS\*.h /L /B /S >> %TEMP%\listfile.txt
dir ..\Extensions\*.cpp /L /B /S  >> %TEMP%\listfile.txt
dir ..\Extensions\*.h /L /B /S  >> %TEMP%\listfile.txt
dir ..\Core\GDCore\*.cpp /L /B /S >> %TEMP%\listfile.txt
dir ..\Core\GDCore\*.h /L /B /S >> %TEMP%\listfile.txt

echo Generating .POT file...
xgettext --from-code utf-8  -o source.pot --c++ --keyword=GD_T --no-wrap -f %TEMP%\listfile.txt -k_

echo source.pot file generated and ready to be sent to Crowdin or used in a translation software like PoEdit.
