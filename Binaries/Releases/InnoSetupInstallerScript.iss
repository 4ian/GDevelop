; Inno Setup installation script for Game Develop.

[Setup]
AppName=Game Develop
AppVersion=3.4
AppPublisher=Florian Rival
AppPublisherURL=http://www.compilgames.net
AppSupportURL=http://www.forum.compilgames.net
AppUpdatesURL=http://www.compilgames.net
DefaultDirName={pf}/Game Develop
DefaultGroupName=Game Develop
AllowNoIcons=yes
LicenseFile=..\Output\Release_Windows\License-fr.rtf
InfoBeforeFile=..\Output\Release_Windows\Informations-fr.rtf
OutputDir=.\
OutputBaseFilename=gd3472
Compression=lzma
SolidCompression=yes
SetupIconFile=..\Output\Release_Windows\res\icon.ico
VersionInfoVersion=3.4
WizardImageFile=Setup bitmap\wizbmp.bmp
WizardSmallImageFile=Setup bitmap/smallicon.bmp
AppCopyright=2008-2014 Florian Rival
VersionInfoCompany=Florian Rival
VersionInfoDescription=Game Develop setup
VersionInfoCopyright=2008-2014 Florian Rival
VersionInfoProductName=Game Develop
VersionInfoProductVersion=3.4

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"; LicenseFile: "..\Output\Release_Windows\License-en.rtf"; InfoBeforeFile: "..\Output\Release_Windows\Informations-en.rtf"
Name: "french"; MessagesFile: "compiler:Languages\French.isl"
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"; LicenseFile: "..\Output\Release_Windows\License-en.rtf"; InfoBeforeFile: "..\Output\Release_Windows\Informations-en.rtf"

[Tasks]
Name: desktopicon; Description: {cm:CreateDesktopIcon}; GroupDescription: {cm:AdditionalIcons}; Flags:
Name: quicklaunchicon; Description: {cm:CreateQuickLaunchIcon}; GroupDescription: {cm:AdditionalIcons}; Flags: unchecked

[Components]
Name: main; Description: Game Develop; Types: full compact custom; Flags: fixed
Name: example; Description: Exemples; Types: full custom;Languages: french;
Name: example; Description: Examples; Types: full custom;Languages: english;
Name: example; Description: Ejemplos; Types: full custom;Languages: spanish;
Name: res; Description: Ressources (Images, sons...); Types: full custom; Languages: french;
Name: res; Description: Resources (images, sounds...); Types: full custom; Languages: english;
Name: res; Description: Recursos (imágenes, sonidos ...); Types: full custom; Languages: spanish;


[Files]
Source: ..\Output\Release_Windows\GDIDE.exe; DestDir: {app}; Flags: ignoreversion
Source: ..\Output\Release_Windows\*; DestDir: {app}; Flags: ignoreversion
Source: ..\Output\Release_Windows\Templates\*; DestDir: {app}\Templates; Flags: ignoreversion createallsubdirs recursesubdirs; Components: main
Source: ..\Output\Release_Windows\res\*; DestDir: {app}\res; Flags: ignoreversion createallsubdirs recursesubdirs; Components: main
Source: ..\Output\Release_Windows\CppPlatform\*; DestDir: {app}\CppPlatform; Flags: ignoreversion createallsubdirs recursesubdirs; Components: main
Source: ..\Output\Release_Windows\JsPlatform\*; DestDir: {app}\JsPlatform; Flags: ignoreversion createallsubdirs recursesubdirs; Components: main
Source: ..\Output\Release_Windows\locale\*; DestDir: {app}\locale; Flags: ignoreversion createallsubdirs recursesubdirs; Components: main
Source: ..\Output\Release_Windows\Examples\*; DestDir: {app}\Examples; Flags: ignoreversion createallsubdirs recursesubdirs; Components: example
Source: ..\Output\Release_Windows\Ressources\*; DestDir: {app}\Ressources; Flags: ignoreversion createallsubdirs recursesubdirs; Components: res
; NOTE: Don't use "Flags: ignoreversion" on any shared system files
Source: ..\Output\Release_Windows\icon.ico; DestDir: {app}; Flags: ignoreversion
Source: ..\Output\Release_Windows\SelectLanguage-en.cfg; DestDir: {userdocs}\..\.Game Develop; Flags: ignoreversion createallsubdirs recursesubdirs; DestName: SelectLanguage.cfg; Languages: english; Components: main
Source: ..\Output\Release_Windows\SelectLanguage-fr.cfg; DestDir: {userdocs}\..\.Game Develop; Flags: ignoreversion createallsubdirs recursesubdirs; DestName: SelectLanguage.cfg; Languages: french ; Components: main
Source: ..\Output\Release_Windows\SelectLanguage-es.cfg; DestDir: {userdocs}\..\.Game Develop; Flags: ignoreversion createallsubdirs recursesubdirs; DestName: SelectLanguage.cfg; Languages: spanish ; Components: main

[Icons]
Name: {group}\Game Develop; Filename: {app}\GDIDE.exe; WorkingDir: {app}
Name: {group}\Aide; Filename: http://www.wiki.compilgames.net ;Languages: french;
Name: {group}\Help; Filename: http://www.wiki.compilgames.net; Languages: english;
Name: {group}\Tutoriel; Filename: http://www.wiki.compilgames.net/doku.php/game_develop/tutoriels; Languages: french;
Name: {group}\Tutorial; Filename: http://www.wiki.compilgames.net/doku.php/en/game_develop/tutorials; Languages: english;
Name: {group}\{cm:ProgramOnTheWeb,Game Develop}; Filename: http://www.compilgames.net
Name: {group}\{cm:UninstallProgram,Game Develop}; Filename: {uninstallexe}
Name: {commondesktop}\Game Develop; Filename: {app}\GDIDE.exe; WorkingDir: {app}; Tasks: desktopicon
Name: {userappdata}\Microsoft\Internet Explorer\Quick Launch\Game Develop; Filename: {app}\GDIDE.exe; WorkingDir: {app}; Tasks: quicklaunchicon

[Run]
Filename: {app}\GDIDE.exe; Description: {cm:LaunchProgram,Game Develop}; Flags: nowait postinstall skipifsilent

[Registry]
Root: HKCR; SubKey: .gdg; ValueType: string; ValueData: Game Develop Game; Flags: uninsdeletekey
Root: HKCR; SubKey: Game Develop Game; ValueType: string; ValueData: Game created with Game Develop; Flags: uninsdeletekey
Root: HKCR; SubKey: Game Develop Game\Shell\Open\Command; ValueType: string; ValueData: """{app}/GDIDE.exe"" ""%1"""; Flags: uninsdeletevalue
Root: HKCR; Subkey: Game Develop Game\DefaultIcon; ValueType: string; ValueData: {app}\icon.ico,-1; Flags: uninsdeletevalue


[InstallDelete]
Type: files; Name: "{app}\GDEditor.exe"
;Prevent crashes with incompatible extensions:
Type: files; Name: "{app}\CppPlatform\Extensions\TextBoxObject.xgdwe"
;Old extensions:
Type: files; Name: "{app}\CppPlatform\Extensions\AStarAutomatism.xgdwe"

Type: filesandordirs; Name: "{app}\Extensions"
Type: filesandordirs; Name: "{app}\include"
Type: filesandordirs; Name: "{app}\Runtime"
