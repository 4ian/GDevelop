@echo off
echo Listing all GDCore, GDCpp, GDJS and Extensions sources files to translate...

dir ..\GDJS\GDJS\*.cpp /L /B /S |find /v /i "\Dialogs\" > %TEMP%\listfile.txt
dir ..\GDJS\GDJS\*.h /L /B /S |find /v /i "\Dialogs\" >> %TEMP%\listfile.txt
dir ..\Extensions\*.cpp /L /B /S >> %TEMP%\listfile.txt
dir ..\Extensions\*.h /L /B /S >> %TEMP%\listfile.txt
dir ..\Extensions\*.js /L /B /S  |find /v /i "box2d.js" |find /v /i "\bondage.js" |find /v /i "\ExampleJsExtension" >> %TEMP%\listfile.txt
dir ..\Core\GDCore\*.cpp /L /B /S |find /v /i "\Dialogs\" >> %TEMP%\listfile.txt
dir ..\Core\GDCore\*.h /L /B /S |find /v /i "\Dialogs\" >> %TEMP%\listfile.txt

echo Generating .POT file...
xgettext --from-code utf-8  -o gdcore-gdcpp-gdjs-extensions-messages.pot --c++ --keyword=GD_T --no-wrap -f %TEMP%\listfile.txt -k_

echo Translation file 'gdcore-gdcpp-gdjs-extensions-messages.pot' generated and ready to be sent to Crowdin or used in a translation software like PoEdit.
