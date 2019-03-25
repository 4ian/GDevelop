@echo off
echo Listing all GDCore, GDCpp, GDJS and Extensions sources files to translate...

dir ..\GDJS\GDJS\*.cpp /L /B /S |find /v /i "\Dialogs\" > %TEMP%\listfile.txt
dir ..\GDJS\GDJS\*.h /L /B /S |find /v /i "\Dialogs\" >> %TEMP%\listfile.txt
dir ..\Extensions\*.cpp /L /B /S  |find /v /i "\Dialogs\" |find /v /i "\AdvancedXML\" >> %TEMP%\listfile.txt
dir ..\Extensions\*.h /L /B /S  |find /v /i "\Dialogs\" |find /v /i "\AdvancedXML\" >> %TEMP%\listfile.txt
dir ..\Core\GDCore\*.cpp /L /B /S |find /v /i "\Dialogs\" >> %TEMP%\listfile.txt
dir ..\Core\GDCore\*.h /L /B /S |find /v /i "\Dialogs\" >> %TEMP%\listfile.txt
REM Don't include old IDE anymore in the translations.
REM newIDE translations are generated separately (see newIDE/app/scripts)
REM dir ..\IDE\*.cpp /L /b /s  |find /v /i "\wxstedit\"  >> %TEMP%\listfile.txt
REM dir ..\IDE\*.h /L /b /s  |find /v /i "\wxstedit\"  >> %TEMP%\listfile.txt

REM Don't include GDCpp anymore in the translations, as these translations were
REM for the old IDE (GDevelop 4).
REM dir ..\GDCpp\GDCpp\*.cpp /L /B /S |find /v /i "\Dialogs\" >> %TEMP%\listfile.txt
REM dir ..\GDCpp\GDCpp\*.h /L /B /S |find /v /i "\Dialogs\" >> %TEMP%\listfile.txt

echo Generating .POT file...
xgettext --from-code utf-8  -o gdcore-gdcpp-gdjs-extensions-messages.pot --c++ --keyword=GD_T --no-wrap -f %TEMP%\listfile.txt -k_

echo Translation file 'gdcore-gdcpp-gdjs-extensions-messages.pot' generated and ready to be sent to Crowdin or used in a translation software like PoEdit.
