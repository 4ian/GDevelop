; *** Inno Setup version 5.5.3+ Chinese (Simplified) messages ***
;   By Qiming Li (qiming at clault.com)
;
; To download user-contributed translations of this file, go to:
;   http://www.jrsoftware.org/files/istrans/
;
; Note: When translating this text, do not add periods (.) to the end of
; messages that didn't have them already, because on those messages Inno
; Setup adds the periods automatically (appending a period would result in
; two periods being displayed).

[LangOptions]
; The following three entries are very important. Be sure to read and 
; understand the '[LangOptions] section' topic in the help file.
LanguageName=<4E2D><6587><FF08><7B80><4F53><FF09>
LanguageID=$0804
LanguageCodePage=936
; If the language you are translating to requires special font faces or
; sizes, uncomment any of the following entries and change them accordingly.
DialogFontName=宋体
;DialogFontSize=8
;WelcomeFontName=Verdana
;WelcomeFontSize=12
;TitleFontName=Arial
;TitleFontSize=29
;CopyrightFontName=Arial
;CopyrightFontSize=8

[Messages]

; *** Application titles
SetupAppTitle=安装向导
SetupWindowTitle=安装向导 - %1
UninstallAppTitle=卸载向导
UninstallAppFullTitle=%1卸载向导

; *** Misc. common
InformationTitle=信息
ConfirmTitle=确认
ErrorTitle=错误

; *** SetupLdr messages
SetupLdrStartupMessage=安装向导将在您的电脑上安装%1。确定要继续吗？
LdrCannotCreateTemp=无法创建临时文件。安装已终止
LdrCannotExecTemp=无法运行临时文件夹中的文件。安装已终止

; *** Startup error messages
LastErrorMessage=%1.%n%n错误 %2: %3
SetupFileMissing=安装目录中缺失文件%1。请解决该问题，或重新获取一份程序拷贝。
SetupFileCorrupt=安装文件已被损坏。请重新获取一份程序拷贝。
SetupFileCorruptOrWrongVer=安装文件已被损坏，或与本安装向导版本不兼容。请解决该问题，或重新获取一份程序拷贝。
InvalidParameter=无效命令行参数：%n%n%1
SetupAlreadyRunning=安装程序已经运行。
WindowsVersionNotSupported=程序不支持您电脑上运行的Windows版本。
WindowsServicePackRequired=程序要求%1 Service Pack %2或更新版本。
NotOnThisPlatform=程序不可在%1上运行。
OnlyOnThisPlatform=程序必须在%1上运行。
OnlyOnTheseArchitectures=程序只能在为以下处理器架构所设计的Windows版本上安装：%n%n%1
MissingWOW64APIs=您所使用的Windows版本没有包含进行64位安装所需的功能。请安装Service Pack %1解决此问题。
WinVersionTooLowError=程序要求%2版本或以上的%1。
WinVersionTooHighError=程序不可安装的%2或更高版本的%1上。
AdminPrivilegesRequired=您必须登录为管理员才能安装此程序。
PowerUserPrivilegesRequired=您必须登录为管理员或高权限用户才能安装此程序。
SetupAppRunningError=安装向导检测到%1正在运行。%n%n请关闭其所有窗口并点击“确定”继续，或点击“取消”退出安装。
UninstallAppRunningError=卸载向导检测到%1正在运行。%n%n请关闭其所有窗口，然后点击“确定”继续，或点击“取消”退出。

; *** Misc. errors
ErrorCreatingDir=安装向导无法创建文件夹“%1”
ErrorTooManyFilesInDir=由于文件夹“%1”中文件过多，无法在其中创建文件

; *** Setup common messages
ExitSetupTitle=退出安装向导
ExitSetupMessage=安装尚未完成。如果现在退出，程序将不会被安装。 %n%n您可以下次再运行安装向导来完成程序的安装。%n%n确定退出安装向导吗？
AboutSetupMenuItem=关于安装向导(&A)…
AboutSetupTitle=关于安装向导
AboutSetupMessage=%1版本%2%n%3%n%n%1主页：%n%4
AboutSetupNote=
TranslatorNote=

; *** Buttons
ButtonBack=< 上一步(&B)
ButtonNext=下一步(&N) >
ButtonInstall=安装(&I)
ButtonOK=确定
ButtonCancel=取消
ButtonYes=是(&Y)
ButtonYesToAll=全选是(&A)
ButtonNo=否(&N)
ButtonNoToAll=全选否(&O)
ButtonFinish=结束(&F)
ButtonBrowse=浏览(&B)…
ButtonWizardBrowse=浏览(&R)…
ButtonNewFolder=创建文件夹(&M)

; *** "Select Language" dialog messages
SelectLanguageTitle=选择语言
SelectLanguageLabel=选择安装时使用语言：

; *** Common wizard text
ClickNext=点击“下一步”继续，或“取消”退出安装向导。
BeveledLabel=
BrowseDialogTitle=浏览选择文件夹
BrowseDialogLabel=在以下列表中选取一个文件夹，并点击“确定”。
NewFolderName=新建文件夹

; *** "Welcome" wizard page
WelcomeLabel1=欢迎使用[name]安装向导
WelcomeLabel2=本向导将在您的电脑上安装[name/ver]%n%n建议您在继续之前关闭其他所有应用程序。

; *** "Password" wizard page
WizardPassword=密码
PasswordLabel1=本安装程序由密码保护。
PasswordLabel3=请输入密码，并点击“下一步”。密码区分大小写。
PasswordEditLabel=密码(&P)：
IncorrectPassword=您输入的密码不正确。请重试。

; *** "License Agreement" wizard page
WizardLicense=许可协议
LicenseLabel=请阅读以下重要信息，然后再进入下一步。
LicenseLabel3=请阅读以下许可协议。您必须接受此协议的条款，然后才能继续安装。
LicenseAccepted=我接受协议(&A)
LicenseNotAccepted=我不接受协议(&D)

; *** "Information" wizard pages
WizardInfoBefore=信息
InfoBeforeLabel=请阅读以下重要信息再进入下一步。
InfoBeforeClickLabel=准备好继续安装后，点击“下一步”。
WizardInfoAfter=信息
InfoAfterLabel=请阅读以下重要信息再进入下一步。
InfoAfterClickLabel=准备好继续安装后，点击“下一步”。

; *** "User Information" wizard page
WizardUserInfo=用户信息
UserInfoDesc=请输入您的信息
UserInfoName=用户名称(&U)：
UserInfoOrg=机构名称(&O)：
UserInfoSerial=序列号码(&S)：
UserInfoNameRequired=必须输入用户名

; *** "Select Destination Location" wizard page
WizardSelectDir=选择安装位置
SelectDirDesc=将[name]安装到何处？
SelectDirLabel3=安装向导将把[name]安装到以下文件夹中。
SelectDirBrowseLabel=点击“下一步”继续。如果您要选择不同的文件夹，请点击“浏览”。
DiskSpaceMBLabel=必须至少有[mb]兆字节（MB）的闲置磁盘空间。
CannotInstallToNetworkDrive=无法安装至网络驱动器。
CannotInstallToUNCPath=无法安装至UNC路径。
InvalidPath=您必须输入包括盘符的完整路径，例如：%n%nC:\应用程序%n%n或如下格式的UNC路径：%n%n\\服务器名\共享目录名
InvalidDrive=您选择的驱动器或UNC共享不存在或不可访问。请另选一个。
DiskSpaceWarningTitle=磁盘空间不足
DiskSpaceWarning=必须至少有%1千字节（KB）的闲置空间才可安装，但所选驱动器仅有%2千字节（KB）可用空间。%n%n您确定要继续吗？
DirNameTooLong=文件夹名称或路径太长。
InvalidDirName=文件夹名称无效。
BadDirName32=文件夹名称不能包含下列字符：%n%n%1
DirExistsTitle=文件夹已存在
DirExists=文件夹%n%n%1%n%n已存在。您确定要安装到该文件夹吗？
DirDoesntExistTitle=文件夹不存在
DirDoesntExist=文件夹%n%n%1%n%n不存在。您要创建该文件夹吗？

; *** "Select Components" wizard page
WizardSelectComponents=选择组件
SelectComponentsDesc=要安装哪些组件？
SelectComponentsLabel2=请选择要安装的组件，清除不要安装的组件。准备好后点击“下一步”。
FullInstallation=全部安装
; if possible don't translate 'Compact' as 'Minimal' (I mean 'Minimal' in your language)
CompactInstallation=简洁安装
CustomInstallation=自定义安装
NoUninstallWarningTitle=组件已存在
NoUninstallWarning=安装向导检测到已经安装下列组件：%n%n%1%n%n取消选定不会卸载这些组件。%n%n您确定要继续安装吗？
ComponentSize1=%1千字节（KB）
ComponentSize2=%1兆字节（MB）
ComponentsDiskSpaceMBLabel=目前所选组件要求至少[mb]兆字节（MB）磁盘空间。

; *** "Select Additional Tasks" wizard page
WizardSelectTasks=选择附加任务
SelectTasksDesc=要执行哪些附加任务？
SelectTasksLabel2=请选择安装[name]时需要执行的附加任务，然后点击“下一步”。

; *** "Select Start Menu Folder" wizard page
WizardSelectProgramGroup=选择开始菜单文件夹
SelectStartMenuFolderDesc=把程序快捷方式放到哪里？
SelectStartMenuFolderLabel3=安装向导将在以下开始菜单文件夹中创建程序快捷方式。
SelectStartMenuFolderBrowseLabel=点击“下一步”继续。如要选择另一个文件夹，点击“浏览”。
MustEnterGroupName=您必须输入文件夹名称
GroupNameTooLong=文件夹名称或路径太长。
InvalidGroupName=文件夹名称无效。
BadGroupName=文件夹名称不能包含下列字符：%n%n%1
NoProgramGroupCheck2=不要创建开始菜单文件夹(&D)

; *** "Ready to Install" wizard page
WizardReady=安装准备完毕
ReadyLabel1=安装向导已准备完毕，将开始在您的电脑上安装[name]。
ReadyLabel2a=点击“安装”开始安装。如要确认或更改设置请点击“上一步”。
ReadyLabel2b=点击“安装”开始安装。
ReadyMemoUserInfo=用户信息：
ReadyMemoDir=安装位置：
ReadyMemoType=安装类型：
ReadyMemoComponents=所选组件：
ReadyMemoGroup=开始菜单文件夹：
ReadyMemoTasks=附加任务：

; *** "Preparing to Install" wizard page
WizardPreparing=准备安装
PreparingDesc=安装向导正在准备在您的电脑上安装[name]。
PreviousInstallNotCompleted=上次程序安装/卸载未能完成。您需要重启电脑来完成上次安装。%n%n电脑重启之后，请重新运行安装向导来安装[name]。 
CannotContinue=安装无法继续。请点击“取消”退出。
ApplicationsFound=安装向导需要更新的文件被下列应用程序占用。建议允许安装向导自动关闭这些应用程序。
ApplicationsFound2=安装向导需要更新的文件被下列应用程序占用。建议允许安装向导自动关闭这些应用程序。安装完成后，安装向导将尝试重新启动这些应用程序。 
CloseApplications=自动关闭应用程序(&A)
DontCloseApplications=不自动关闭应用程序(&D)
ErrorCloseApplications=安装向导无法自动关闭所有的应用程序。在进入下一步之前，建议您关闭那些占用安装向导需要更新文件的应用程序。

; *** "Installing" wizard page
WizardInstalling=正在安装
InstallingLabel=请稍候，安装向导正在您的电脑上安装[name]。

; *** "Setup Completed" wizard page
FinishedHeadingLabel=[name]安装完成
FinishedLabelNoIcons=安装向导已在您的电脑上安装[name]。
FinishedLabel=安装向导已在您的电脑上安装[name]。可以通过已安装的快捷方式来打开此应用程序。
ClickFinish=点击“结束”退出安装。
FinishedRestartLabel=为了完成[name]的安装，安装向导必须重启您的电脑。要立即重启吗？
FinishedRestartMessage=为了完成[name]的安装，安装向导必须重启您的电脑。%n%n要立即重启吗？
ShowReadmeCheck=是，我要阅读自述文件
YesRadio=是，立即重启电脑(&Y)
NoRadio=否，稍后我再重启电脑(&N)
; used for example as 'Run MyProg.exe'
RunEntryExec=运行%1
; used for example as 'View Readme.txt'
RunEntryShellExec=查阅%1

; *** "Setup Needs the Next Disk" stuff
ChangeDiskTitle=安装向导需要下一张磁盘
SelectDiskLabel2=请插入磁盘%1 并点击“确定”。%n%n如果该磁盘中的文件并不在以下所示文件夹中，请输入正确的路径或点击“浏览”。
PathLabel=路径(&P)：
FileNotInDir2=文件“%1”不在“%2”中。请插入正确的磁盘或选择其它文件夹。
SelectDirectoryLabel=请指定下一张磁盘的位置。

; *** Installation phase messages
SetupAborted=安装未能完成。%n%n请解决问题后再重新运行安装向导。
EntryAbortRetryIgnore=点击“重试”重新尝试，点击“忽略”继续安装，或点击“中止”取消安装。

; *** Installation status messages
StatusClosingApplications=正在关闭应用程序…
StatusCreateDirs=正在创建文件夹…
StatusExtractFiles=正在取出文件…
StatusCreateIcons=正在创建快捷方式…
StatusCreateIniEntries=正在创建INI条目…
StatusCreateRegistryEntries=正在创建注册表条目…
StatusRegisterFiles=正在创建注册表项目…
StatusSavingUninstall=正在保存卸载信息…
StatusRunProgram=正在结束安装…
StatusRestartingApplications=正在重启应用程序…
StatusRollback=正在撤销更改…

; *** Misc. errors
ErrorInternal2=内部错误：%1
ErrorFunctionFailedNoCode=%1失败
ErrorFunctionFailed=%1失败，错误码%2
ErrorFunctionFailedWithMessage=%1失败，错误码%2。%n%3
ErrorExecutingProgram=无法运行程序：%n%1

; *** Registry errors
ErrorRegOpenKey=打开注册表键时出错：%n%1\%2
ErrorRegCreateKey=创建注册表键时出错：%n%1\%2
ErrorRegWriteKey=写入注册表键时出错：%n%1\%2

; *** INI errors
ErrorIniEntry=在文件“%1”中创建INI条目时出错。

; *** File copying errors
FileAbortRetryIgnore=点击“重试”重新尝试，点击“忽略”跳过此文件（不推荐这样做），或点击“中止”取消安装。
FileAbortRetryIgnore2=点击“重试”重新尝试，点击“忽略”继续安装（不推荐这样做），或点击“中止”取消安装。
SourceIsCorrupted=源文件已损坏
SourceDoesntExist=源文件“%1”不存在
ExistingFileReadOnly=现有文件被标记为只读。%n%n点击“重试”移除其只读属性并重新尝试，点击“忽略”跳过此文件，或点击“中止”取消安装。
ErrorReadingExistingDest=读取现有文件时出错：
FileExists=文件已存在。%n%n让安装向导覆盖它吗？
ExistingFileNewer=现有文件比安装向导试图安装的还要新。建议保留现有文件。%n%n您要保留现有文件吗？
ErrorChangingAttr=更改现有文件属性时出错：
ErrorCreatingTemp=在目的文件夹中创建文件时出错：
ErrorReadingSource=读取源文件时出错：
ErrorCopying=复制文件时出错：
ErrorReplacingExistingFile=替换现有文件时出错：
ErrorRestartReplace=重启替换失败：
ErrorRenamingTemp=为目的文件夹中文件重命名时出错：
ErrorRegisterServer=无法注册动态库或控件（DLL/OCX）：%1
ErrorRegSvr32Failed=运行RegSvr32失败，其返回值为：%1
ErrorRegisterTypeLib=无法注册类型库：%1

; *** Post-installation errors
ErrorOpeningReadme=打开自述文件时出错。
ErrorRestartingComputer=安装向导无法重启电脑。请手动重启。

; *** Uninstaller messages
UninstallNotFound=文件“%1”不存在。无法卸载。
UninstallOpenError=无法打开文件“%1”。无法卸载
UninstallUnsupportedVer=此版本的卸载向导无法识别卸载日志文件“%1”的格式。无法卸载
UninstallUnknownEntry=在卸载日志中遇到未知条目 (%1)
ConfirmUninstall=您是否确定要完全删除%1及其所有组件？
UninstallOnlyOnWin64=此安装只能在64位Windows上卸载。
OnlyAdminCanUninstall=此安装只能由具备管理员权限的用户卸载。
UninstallStatusLabel=请稍候，正在删除%1。
UninstalledAll=已成功地从您的电脑中删除%1。
UninstalledMost=%1卸载完毕。%n%n某些项目无法在卸载过程中删除。可以手动删除这些项目。
UninstalledAndNeedsRestart=若要完成%1的卸载，必须重启电脑。%n%n要立即重启吗？
UninstallDataCorrupted=文件“%1”已损坏。无法卸载

; *** Uninstallation phase messages
ConfirmDeleteSharedFileTitle=删除共享文件吗？
ConfirmDeleteSharedFile2=系统显示没有任何程序使用以下共享文件。要删除该共享文件吗？%n%n如果有程序使用该文件，当它被删除后这些程序可能无法正常运行。如果不确定，请选择“否”。留下该文件不会对系统造成任何危害。
SharedFileNameLabel=文件名：
SharedFileLocationLabel=位置：
WizardUninstalling=卸载状态
StatusUninstalling=正在卸载%1…

; *** Shutdown block reasons
ShutdownBlockReasonInstallingApp=正在安装%1。
ShutdownBlockReasonUninstallingApp=正在卸载%1。

; The custom messages below aren't used by Setup itself, but if you make
; use of them in your scripts, you'll want to translate them.

[CustomMessages]

NameAndVersion=%1版本%2
AdditionalIcons=附加快捷方式：
CreateDesktopIcon=创建桌面快捷方式(&D)
CreateQuickLaunchIcon=创建快速启动栏快捷方式(&Q)
ProgramOnTheWeb=%1网站
UninstallProgram=卸载%1
LaunchProgram=运行%1
AssocFileExtension=将%1与%2文件扩展名关联(&A)
AssocingFileExtension=正在将%1与%2文件扩展名关联…
AutoStartProgramGroupDescription=启动：
AutoStartProgram=自动启动%1
AddonHostProgramNotFound=在您所选文件夹中找不到%1。%n%n是否仍然继续？
