; Inno Setup installation script for GDevelop 4.

[Setup]
AppName=GDevelop
AppVersion=4.0
AppPublisher=Florian Rival
AppPublisherURL=http://www.compilgames.net
AppSupportURL=http://www.forum.compilgames.net
AppUpdatesURL=http://www.compilgames.net
DefaultDirName={pf}/GDevelop
DefaultGroupName=GDevelop
AllowNoIcons=yes
LicenseFile=..\Output\Release_Windows\License-en.rtf
InfoBeforeFile=..\Output\Release_Windows\Informations-en.rtf
OutputDir=.\
OutputBaseFilename=gd4096
Compression=lzma
SolidCompression=yes
SetupIconFile=..\Output\Release_Windows\res\icon.ico
VersionInfoVersion=4.0
WizardImageFile=Setup bitmap\wizbmp.bmp
WizardSmallImageFile=Setup bitmap/smallicon.bmp
AppCopyright=2008-2017 Florian Rival
VersionInfoCompany=Florian Rival
VersionInfoDescription=GDevelop setup
VersionInfoCopyright=2008-2016 Florian Rival
VersionInfoProductName=GDevelop
VersionInfoProductVersion=4.0

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl";
Name: "french"; MessagesFile: "compiler:Languages\French.isl"; LicenseFile: "..\Output\Release_Windows\License-fr.rtf"; InfoBeforeFile: "..\Output\Release_Windows\Informations-fr.rtf"
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl";
Name: "russian"; MessagesFile: "compiler:Languages\Russian.isl";
Name: "portuguese"; MessagesFile: "compiler:Languages\Portuguese.isl";
Name: "german"; MessagesFile: "compiler:Languages\German.isl";
Name: "chinese"; MessagesFile: "..\Packaging\innosetup-languages\ChineseSimplified.isl";
Name: "italian"; MessagesFile: "compiler:Languages\Italian.isl";
Name: "finnish"; MessagesFile: "compiler:Languages\Finnish.isl";
Name: "polish"; MessagesFile: "compiler:Languages\Polish.isl";
Name: "dutch"; MessagesFile: "compiler:Languages\Dutch.isl";

[Tasks]
Name: desktopicon; Description: {cm:CreateDesktopIcon}; GroupDescription: {cm:AdditionalIcons}; Flags:
Name: quicklaunchicon; Description: {cm:CreateQuickLaunchIcon}; GroupDescription: {cm:AdditionalIcons}; Flags: unchecked

[Components]
Name: "main"; Description: "GDevelop"; Types: full compact custom; Flags: fixed
Name: "example"; Description: "Exemples"; Types: full custom; Languages: french
Name: "example"; Description: "Examples"; Types: full custom; Languages: english russian italian polish chinese dutch finnish
Name: "example"; Description: "Ejemplos"; Types: full custom; Languages: spanish
Name: "res"; Description: "Ressources (Images, sons...)"; Types: full custom; Languages: french
Name: "res"; Description: "Resources (images, sounds...)"; Types: full custom; Languages: english russian italian polish chinese dutch finnish
Name: "res"; Description: "Recursos (im�genes, sonidos ...)"; Types: full custom; Languages: spanish

[Files]
Source: ..\Output\Release_Windows\GDIDE.exe; DestDir: {app}; Flags: ignoreversion
Source: ..\Output\Release_Windows\*; DestDir: {app}; Flags: ignoreversion
Source: ..\Output\Release_Windows\Templates\*; DestDir: {app}\Templates; Flags: ignoreversion createallsubdirs recursesubdirs; Components: main
Source: ..\Output\Release_Windows\res\*; DestDir: {app}\res; Flags: ignoreversion createallsubdirs recursesubdirs; Components: main
Source: ..\Output\Release_Windows\CppPlatform\*; DestDir: {app}\CppPlatform; Flags: ignoreversion createallsubdirs recursesubdirs; Components: main
Source: ..\Output\Release_Windows\JsPlatform\*; DestDir: {app}\JsPlatform; Flags: ignoreversion createallsubdirs recursesubdirs; Components: main
Source: ..\Output\Release_Windows\locale\*; DestDir: {app}\locale; Flags: ignoreversion createallsubdirs recursesubdirs; Components: main
Source: ..\Output\Release_Windows\Examples\*; DestDir: {app}\Examples; Flags: ignoreversion createallsubdirs recursesubdirs; Components: example
Source: ..\Output\Release_Windows\Free resources\*; DestDir: {app}\Free resources; Flags: ignoreversion createallsubdirs recursesubdirs; Components: res
; NOTE: Don't use "Flags: ignoreversion" on any shared system files
Source: ..\Output\Release_Windows\icon.ico; DestDir: {app}; Flags: ignoreversion
Source: ..\Output\Release_Windows\SelectLanguage-en.cfg; DestDir: {userdocs}\..\.GDevelop; Flags: ignoreversion createallsubdirs recursesubdirs; DestName: SelectLanguage.cfg; Languages: english; Components: main
Source: ..\Output\Release_Windows\SelectLanguage-fr.cfg; DestDir: {userdocs}\..\.GDevelop; Flags: ignoreversion createallsubdirs recursesubdirs; DestName: SelectLanguage.cfg; Languages: french ; Components: main
Source: ..\Output\Release_Windows\SelectLanguage-es.cfg; DestDir: {userdocs}\..\.GDevelop; Flags: ignoreversion createallsubdirs recursesubdirs; DestName: SelectLanguage.cfg; Languages: spanish ; Components: main
Source: ..\Output\Release_Windows\SelectLanguage-ru.cfg; DestDir: {userdocs}\..\.GDevelop; Flags: ignoreversion createallsubdirs recursesubdirs; DestName: SelectLanguage.cfg; Languages: russian ; Components: main
Source: ..\Output\Release_Windows\SelectLanguage-de.cfg; DestDir: {userdocs}\..\.GDevelop; Flags: ignoreversion createallsubdirs recursesubdirs; DestName: SelectLanguage.cfg; Languages: german ; Components: main
Source: ..\Output\Release_Windows\SelectLanguage-pt.cfg; DestDir: {userdocs}\..\.GDevelop; Flags: ignoreversion createallsubdirs recursesubdirs; DestName: SelectLanguage.cfg; Languages: portuguese ; Components: main
Source: ..\Output\Release_Windows\SelectLanguage-pl.cfg; DestDir: {userdocs}\..\.GDevelop; Flags: ignoreversion createallsubdirs recursesubdirs; DestName: SelectLanguage.cfg; Languages: polish ; Components: main
Source: ..\Output\Release_Windows\SelectLanguage-zh.cfg; DestDir: {userdocs}\..\.GDevelop; Flags: ignoreversion createallsubdirs recursesubdirs; DestName: SelectLanguage.cfg; Languages: chinese ; Components: main
Source: ..\Output\Release_Windows\SelectLanguage-it.cfg; DestDir: {userdocs}\..\.GDevelop; Flags: ignoreversion createallsubdirs recursesubdirs; DestName: SelectLanguage.cfg; Languages: italian ; Components: main
Source: ..\Output\Release_Windows\SelectLanguage-nl.cfg; DestDir: {userdocs}\..\.GDevelop; Flags: ignoreversion createallsubdirs recursesubdirs; DestName: SelectLanguage.cfg; Languages: dutch ; Components: main
Source: ..\Output\Release_Windows\SelectLanguage-fi.cfg; DestDir: {userdocs}\..\.GDevelop; Flags: ignoreversion createallsubdirs recursesubdirs; DestName: SelectLanguage.cfg; Languages: finnish ; Components: main

[Icons]
Name: {group}\GDevelop; Filename: {app}\GDIDE.exe; WorkingDir: {app}
Name: {group}\Aide; Filename: http://www.wiki.compilgames.net ;Languages: french;
Name: {group}\Help; Filename: http://www.wiki.compilgames.net; Languages: english;
Name: {group}\Tutoriel; Filename: http://www.wiki.compilgames.net/doku.php/game_develop/tutoriels; Languages: french;
Name: {group}\Tutorial; Filename: http://www.wiki.compilgames.net/doku.php/en/game_develop/tutorials; Languages: english;
Name: {group}\{cm:ProgramOnTheWeb,GDevelop}; Filename: http://www.compilgames.net
Name: {group}\{cm:UninstallProgram,GDevelop}; Filename: {uninstallexe}
Name: {commondesktop}\GDevelop; Filename: {app}\GDIDE.exe; WorkingDir: {app}; Tasks: desktopicon
Name: {userappdata}\Microsoft\Internet Explorer\Quick Launch\GDevelop; Filename: {app}\GDIDE.exe; WorkingDir: {app}; Tasks: quicklaunchicon

[Run]
Filename: {app}\GDIDE.exe; Description: {cm:LaunchProgram,GDevelop}; Flags: nowait postinstall skipifsilent

[Registry]
Root: HKCR; SubKey: .gdg; ValueType: string; ValueData: GDevelop Game; Flags: uninsdeletekey
Root: HKCR; SubKey: GDevelop Game; ValueType: string; ValueData: Game created with GDevelop; Flags: uninsdeletekey
Root: HKCR; SubKey: GDevelop Game\Shell\Open\Command; ValueType: string; ValueData: """{app}/GDIDE.exe"" ""%1"""; Flags: uninsdeletevalue
Root: HKCR; Subkey: GDevelop Game\DefaultIcon; ValueType: string; ValueData: {app}\icon.ico,-1; Flags: uninsdeletevalue


[InstallDelete]
Type: files; Name: "{app}\GDEditor.exe"
;Prevent crashes with incompatible extensions:
Type: files; Name: "{app}\CppPlatform\Extensions\TextBoxObject.xgdwe"
;Old extensions:
Type: files; Name: "{app}\CppPlatform\Extensions\AStarBehavior.xgdwe"

Type: filesandordirs; Name: "{app}\Extensions"
Type: filesandordirs; Name: "{app}\include"
Type: filesandordirs; Name: "{app}\Runtime"
