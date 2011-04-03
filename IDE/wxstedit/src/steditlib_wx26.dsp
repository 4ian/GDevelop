# Microsoft Developer Studio Project File - Name="StEditLib_wx26" - Package Owner=<4>
# Microsoft Developer Studio Generated Build File, Format Version 6.00
# ** DO NOT EDIT **

# TARGTYPE "Win32 (x86) Dynamic-Link Library" 0x0102
# TARGTYPE "Win32 (x86) Static Library" 0x0104

CFG=StEditLib_wx26 - Win32 Debug
!MESSAGE This is not a valid makefile. To build this project using NMAKE,
!MESSAGE use the Export Makefile command and run
!MESSAGE 
!MESSAGE NMAKE /f "StEditLib_wx26.mak".
!MESSAGE 
!MESSAGE You can specify a configuration when running NMAKE
!MESSAGE by defining the macro CFG on the command line. For example:
!MESSAGE 
!MESSAGE NMAKE /f "StEditLib_wx26.mak" CFG="StEditLib_wx26 - Win32 Debug"
!MESSAGE 
!MESSAGE Possible choices for configuration are:
!MESSAGE 
!MESSAGE "StEditLib_wx26 - Win32 Release" (based on "Win32 (x86) Static Library")
!MESSAGE "StEditLib_wx26 - Win32 Debug" (based on "Win32 (x86) Static Library")
!MESSAGE 

# Begin Project
# PROP AllowPerConfigDependencies 0
# PROP Scc_ProjName ""
# PROP Scc_LocalPath ""
CPP=cl.exe
RSC=rc.exe


!IF  "$(CFG)" == "StEditLib_wx26 - Win32 Release"

# PROP BASE Use_MFC 0
# PROP BASE Use_Debug_Libraries 0
# PROP BASE Output_Dir "vc_msw_wx26"
# PROP BASE Intermediate_Dir "vc_msw_wx26"
# PROP BASE Target_Dir ""
# PROP Use_MFC 0
# PROP Use_Debug_Libraries 0
# PROP Output_Dir "vc_msw_wx26"
# PROP Intermediate_Dir "vc_msw_wx26"
# PROP Target_Dir ""
# ADD BASE CPP /nologo /FD /GR /GX /MD /O1 /GR /GX /W4 /Fdvc_msw_wx26\StEditLib_wx26.pdb /D "WIN32" /D "_LIB" /D "__WXMSW__" /D "__WX__" /c
# ADD CPP /nologo /FD /GR /GX /MD /O1 /GR /GX /I "$(WXWIN)\include" /I "$(WXWIN)\lib\vc_lib\msw" /I "." /I "$(WXWIN)\contrib\include" /I "..\include" /W4 /Fdvc_msw_wx26\StEditLib_wx26.pdb /D "WIN32" /D "_LIB" /D "__WXMSW__" /D "__WX__" /c
# ADD BASE RSC /l 0x405
# ADD RSC /l 0x405
BSC32=bscmake.exe
# ADD BASE BSC32 /nologo
# ADD BSC32 /nologo
LIB32=link.exe -lib
# ADD BASE LIB32 /nologo /out:"vc_msw_wx26\StEditLib_wx26.lib"
# ADD LIB32 /nologo /out:"vc_msw_wx26\StEditLib_wx26.lib"

!ELSEIF  "$(CFG)" == "StEditLib_wx26 - Win32 Debug"

# PROP BASE Use_MFC 0
# PROP BASE Use_Debug_Libraries 1
# PROP BASE Output_Dir "vc_mswd_wx26"
# PROP BASE Intermediate_Dir "vc_mswd_wx26"
# PROP BASE Target_Dir ""
# PROP Use_MFC 0
# PROP Use_Debug_Libraries 1
# PROP Output_Dir "vc_mswd_wx26"
# PROP Intermediate_Dir "vc_mswd_wx26"
# PROP Target_Dir ""
# ADD BASE CPP /nologo /FD /GR /GX /MDd /Od /GR /GX /W4 /Zi /Gm /GZ /Fdvc_mswd_wx26\StEditLibd_wx26.pdb /D "WIN32" /D "_LIB" /D "_DEBUG" /D "__WXMSW__" /D "__WXDEBUG__" /D "__WX__" /c
# ADD CPP /nologo /FD /GR /GX /MDd /Od /GR /GX /I "$(WXWIN)\include" /I "$(WXWIN)\lib\vc_lib\mswd" /I "." /I "$(WXWIN)\contrib\include" /I "..\include" /W4 /Zi /Gm /GZ /Fdvc_mswd_wx26\StEditLibd_wx26.pdb /D "WIN32" /D "_LIB" /D "_DEBUG" /D "__WXMSW__" /D "__WXDEBUG__" /D "__WX__" /c
# ADD BASE RSC /l 0x405
# ADD RSC /l 0x405
BSC32=bscmake.exe
# ADD BASE BSC32 /nologo
# ADD BSC32 /nologo
LIB32=link.exe -lib
# ADD BASE LIB32 /nologo /out:"vc_mswd_wx26\StEditLibd_wx26.lib"
# ADD LIB32 /nologo /out:"vc_mswd_wx26\StEditLibd_wx26.lib"

!ENDIF

# Begin Target

# Name "StEditLib_wx26 - Win32 Release"
# Name "StEditLib_wx26 - Win32 Debug"

# PROP Default_Filter ""
# Begin Source File

SOURCE=.\stedit.cpp
# End Source File
# Begin Source File

SOURCE=.\stedlgs.cpp
# End Source File
# Begin Source File

SOURCE=.\stedlgs_wdr.cpp
# End Source File
# Begin Source File

SOURCE=.\steexprt.cpp
# End Source File
# Begin Source File

SOURCE=.\stefindr.cpp
# End Source File
# Begin Source File

SOURCE=.\steframe.cpp
# End Source File
# Begin Source File

SOURCE=.\stelangs.cpp
# End Source File
# Begin Source File

SOURCE=.\stemenum.cpp
# End Source File
# Begin Source File

SOURCE=.\stenoteb.cpp
# End Source File
# Begin Source File

SOURCE=.\steopts.cpp
# End Source File
# Begin Source File

SOURCE=.\steprefs.cpp
# End Source File
# Begin Source File

SOURCE=.\steprint.cpp
# End Source File
# Begin Source File

SOURCE=.\steshell.cpp
# End Source File
# Begin Source File

SOURCE=.\stesplit.cpp
# End Source File
# Begin Source File

SOURCE=.\stestyls.cpp
# End Source File
# Begin Source File

SOURCE=..\include\wx\stedit\pairarr.h
# End Source File
# Begin Source File

SOURCE=..\include\wx\stedit\setup.h
# End Source File
# Begin Source File

SOURCE=..\include\wx\stedit\stedefs.h
# End Source File
# Begin Source File

SOURCE=..\include\wx\stedit\stedit.h
# End Source File
# Begin Source File

SOURCE=..\include\wx\stedit\stedlgs.h
# End Source File
# Begin Source File

SOURCE=..\include\wx\stedit\steexprt.h
# End Source File
# Begin Source File

SOURCE=..\include\wx\stedit\stefindr.h
# End Source File
# Begin Source File

SOURCE=..\include\wx\stedit\steframe.h
# End Source File
# Begin Source File

SOURCE=..\include\wx\stedit\stelangs.h
# End Source File
# Begin Source File

SOURCE=..\include\wx\stedit\stemenum.h
# End Source File
# Begin Source File

SOURCE=..\include\wx\stedit\stenoteb.h
# End Source File
# Begin Source File

SOURCE=..\include\wx\stedit\steopts.h
# End Source File
# Begin Source File

SOURCE=..\include\wx\stedit\steprefs.h
# End Source File
# Begin Source File

SOURCE=..\include\wx\stedit\steprint.h
# End Source File
# Begin Source File

SOURCE=..\include\wx\stedit\steshell.h
# End Source File
# Begin Source File

SOURCE=..\include\wx\stedit\stesplit.h
# End Source File
# Begin Source File

SOURCE=..\include\wx\stedit\stestyls.h
# End Source File
# Begin Source File

SOURCE=..\include\wx\stedit\wx24defs.h
# End Source File
# End Target
# End Project
