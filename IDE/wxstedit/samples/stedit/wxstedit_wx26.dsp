# Microsoft Developer Studio Project File - Name="wxStEdit_wx26" - Package Owner=<4>
# Microsoft Developer Studio Generated Build File, Format Version 6.00
# ** DO NOT EDIT **

# TARGTYPE "Win32 (x86) Application" 0x0101

CFG=wxStEdit_wx26 - Win32 Debug
!MESSAGE This is not a valid makefile. To build this project using NMAKE,
!MESSAGE use the Export Makefile command and run
!MESSAGE 
!MESSAGE NMAKE /f "wxStEdit_wx26.mak".
!MESSAGE 
!MESSAGE You can specify a configuration when running NMAKE
!MESSAGE by defining the macro CFG on the command line. For example:
!MESSAGE 
!MESSAGE NMAKE /f "wxStEdit_wx26.mak" CFG="wxStEdit_wx26 - Win32 Debug"
!MESSAGE 
!MESSAGE Possible choices for configuration are:
!MESSAGE 
!MESSAGE "wxStEdit_wx26 - Win32 Release" (based on "Win32 (x86) Application")
!MESSAGE "wxStEdit_wx26 - Win32 Debug" (based on "Win32 (x86) Application")
!MESSAGE 

# Begin Project
# PROP AllowPerConfigDependencies 0
# PROP Scc_ProjName ""
# PROP Scc_LocalPath ""
CPP=cl.exe
MTL=midl.exe
RSC=rc.exe

!IF  "$(CFG)" == "wxStEdit_wx26 - Win32 Release"

# PROP BASE Use_MFC 0
# PROP BASE Use_Debug_Libraries 0
# PROP BASE Output_Dir "vc_msw_wx26"
# PROP BASE Intermediate_Dir "vc_msw_wx26\wxStEdit"
# PROP BASE Target_Dir ""
# PROP Use_MFC 0
# PROP Use_Debug_Libraries 0
# PROP Output_Dir "vc_msw_wx26"
# PROP Intermediate_Dir "vc_msw_wx26\wxStEdit"
# PROP Target_Dir ""
# ADD BASE CPP /nologo /FD /GR /GX /MD /Fdvc_msw_wx26\wxStEdit.pdb /O1 /GR /GX /I "$(WXWIN)\include" /I "$(WXWIN)\lib\vc_lib\msw" /W4 /I "." /I "$(WXWIN)\contrib\include" /D "WIN32" /D "__WXMSW__" /D "_WINDOWS" /c
# ADD CPP /nologo /FD /GR /GX /MD /Fdvc_msw_wx26\wxStEdit.pdb /O1 /GR /GX /I "$(WXWIN)\include" /I "$(WXWIN)\lib\vc_lib\msw" /W4 /I "." /I "$(WXWIN)\contrib\include" /I "..\..\include" /D "WIN32" /D "__WXMSW__" /D "_WINDOWS" /c
# ADD BASE MTL /nologo /D "WIN32" /D "__WXMSW__" /D "_WINDOWS" /mktyplib203 /win32
# ADD MTL /nologo /D "WIN32" /D "__WXMSW__" /D "_WINDOWS" /mktyplib203 /win32
# ADD BASE RSC /l 0x405 /d "__WXMSW__" /i "$(WXWIN)\include" /i "$(WXWIN)\lib\vc_lib\msw" /i "." /d "_WINDOWS" 
# ADD RSC /l 0x405 /d "__WXMSW__" /i "$(WXWIN)\include" /i "$(WXWIN)\lib\vc_lib\msw" /i "." /d "_WINDOWS" 
BSC32=bscmake.exe
# ADD BASE BSC32 /nologo
# ADD BSC32 /nologo
LINK32=link.exe
# ADD BASE LINK32 wxbase26_net.lib wxmsw26_stc.lib wxmsw26_adv.lib  wxmsw26_core.lib wxbase26.lib wxtiff.lib wxjpeg.lib wxpng.lib wxzlib.lib wxregex.lib wxexpat.lib kernel32.lib user32.lib gdi32.lib comdlg32.lib winspool.lib winmm.lib shell32.lib comctl32.lib odbc32.lib ole32.lib oleaut32.lib uuid.lib rpcrt4.lib advapi32.lib wsock32.lib oleacc.lib /nologo /machine:i386 /out:"vc_msw_wx26\wxStEdit.exe" /libpath:"$(WXWIN)\lib\vc_lib" /subsystem:windows
# ADD LINK32 ..\..\src\vc_msw_wx26\StEditLib_wx26.lib wxmsw26_html.lib wxbase26_net.lib wxmsw26_stc.lib wxmsw26_adv.lib  wxmsw26_core.lib wxbase26.lib wxtiff.lib wxjpeg.lib wxpng.lib wxzlib.lib wxregex.lib wxexpat.lib kernel32.lib user32.lib gdi32.lib comdlg32.lib winspool.lib winmm.lib shell32.lib comctl32.lib odbc32.lib ole32.lib oleaut32.lib uuid.lib rpcrt4.lib advapi32.lib wsock32.lib oleacc.lib /nologo /machine:i386 /out:"vc_msw_wx26\wxStEdit.exe" /libpath:"$(WXWIN)\lib\vc_lib" /subsystem:windows

!ELSEIF  "$(CFG)" == "wxStEdit_wx26 - Win32 Debug"

# PROP BASE Use_MFC 0
# PROP BASE Use_Debug_Libraries 1
# PROP BASE Output_Dir "vc_mswd_wx26"
# PROP BASE Intermediate_Dir "vc_mswd_wx26\wxStEdit"
# PROP BASE Target_Dir ""
# PROP Use_MFC 0
# PROP Use_Debug_Libraries 1
# PROP Output_Dir "vc_mswd_wx26"
# PROP Intermediate_Dir "vc_mswd_wx26\wxStEdit"
# PROP Target_Dir ""
# ADD BASE CPP /nologo /FD /GR /GX /MDd /Zi /Gm /GZ /Fdvc_mswd_wx26\wxStEdit.pdb /Od /GR /GX /I "$(WXWIN)\include" /I "$(WXWIN)\lib\vc_lib\mswd" /W4 /I "." /I "$(WXWIN)\contrib\include" /D "WIN32" /D "_DEBUG" /D "__WXMSW__" /D "__WXDEBUG__" /D "_WINDOWS"/c 
# ADD CPP /nologo /FD /GR /GX /MDd /Zi /Gm /GZ /Fdvc_mswd_wx26\wxStEdit.pdb /Od /GR /GX /I "$(WXWIN)\include" /I "$(WXWIN)\lib\vc_lib\mswd" /W4 /I "." /I "$(WXWIN)\contrib\include" /I "..\..\include" /D "WIN32" /D "_DEBUG" /D "__WXMSW__" /D "__WXDEBUG__" /D "_WINDOWS" /c
# ADD BASE MTL /nologo /D "WIN32" /D "_DEBUG" /D "__WXMSW__" /D "__WXDEBUG__" /D "_WINDOWS" /mktyplib203 /win32
# ADD MTL /nologo /D "WIN32" /D "_DEBUG" /D "__WXMSW__" /D "__WXDEBUG__" /D "_WINDOWS" /mktyplib203 /win32
# ADD BASE RSC /l 0x405 /d "_DEBUG" /d "__WXMSW__" /d "__WXDEBUG__" /i "$(WXWIN)\include" /i "$(WXWIN)\lib\vc_lib\mswd" /i "." /d "_WINDOWS" 
# ADD RSC /l 0x405 /d "_DEBUG" /d "__WXMSW__" /d "__WXDEBUG__" /i "$(WXWIN)\include" /i "$(WXWIN)\lib\vc_lib\mswd" /i "." /d "_WINDOWS" 
BSC32=bscmake.exe
# ADD BASE BSC32 /nologo
# ADD BSC32 /nologo
LINK32=link.exe
# ADD BASE LINK32 wxbase26d_net.lib wxmsw26d_stc.lib wxmsw26d_adv.lib wxmsw26d_core.lib wxbase26d.lib wxtiffd.lib wxjpegd.lib wxpngd.lib wxzlibd.lib wxregexd.lib wxexpatd.lib kernel32.lib user32.lib gdi32.lib comdlg32.lib winspool.lib winmm.lib shell32.lib comctl32.lib odbc32.lib ole32.lib oleaut32.lib uuid.lib rpcrt4.lib advapi32.lib wsock32.lib oleacc.lib /nologo /machine:i386 /out:"vc_mswd_wx26\wxStEdit.exe" /debug /libpath:"$(WXWIN)\lib\vc_lib" /subsystem:windows
# ADD LINK32 ..\..\src\vc_mswd_wx26\StEditLibd_wx26.lib wxmsw26d_html.lib wxbase26d_net.lib wxmsw26d_stc.lib wxmsw26d_adv.lib wxmsw26d_core.lib wxbase26d.lib wxtiffd.lib wxjpegd.lib wxpngd.lib wxzlibd.lib wxregexd.lib wxexpatd.lib kernel32.lib user32.lib gdi32.lib comdlg32.lib winspool.lib winmm.lib shell32.lib comctl32.lib odbc32.lib ole32.lib oleaut32.lib uuid.lib rpcrt4.lib advapi32.lib wsock32.lib oleacc.lib /nologo /machine:i386 /out:"vc_mswd_wx26\wxStEdit.exe" /debug /libpath:"$(WXWIN)\lib\vc_lib" /subsystem:windows

!ENDIF

# Begin Target

# Name "wxStEdit_wx26 - Win32 Release"
# Name "wxStEdit_wx26 - Win32 Debug"
# Begin Group "Source Files"

# PROP Default_Filter ""
# Begin Source File

SOURCE=.\wxStEdit.cpp
# End Source File
# Begin Source File

SOURCE=.\wxStEdit.rc
# End Source File
# End Group
# End Target
# End Project

