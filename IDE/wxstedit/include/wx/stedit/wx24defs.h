/////////////////////////////////////////////////////////////////////////////
// Name:        wx24defs.h
// Purpose:     Definitions to make a program using wxWidgets >= 2.5 work in 2.4
// Author:      John Labenski
// Modified by:
// Created:     3/10/04
// RCS-ID:
// Copyright:   (c) John Labenski
// Licence:     wxWidgets licence
/////////////////////////////////////////////////////////////////////////////

#ifndef __WX_WX24DEFS_H__
#define __WX_WX24DEFS_H__

// Include any headers that we need to redefine macros for
#include "wx/defs.h"
#include "wx/object.h"
#include "wx/event.h"
#include "wx/dynarray.h"

//-----------------------------------------------------------------------------
// wxWidgets 2.6 compatibility with code from >= 2.8

#include "wx/filedlg.h"

#if !wxCHECK_VERSION(2,8,0)
    #define wxFD_OPEN             wxOPEN
    #define wxFD_SAVE             wxSAVE
    #define wxFD_FILE_MUST_EXIST  wxFILE_MUST_EXIST
    #define wxFD_OVERWRITE_PROMPT wxOVERWRITE_PROMPT
#endif

//-----------------------------------------------------------------------------
// wxWidgets 2.4 compatibility with code from >= 2.5

#ifndef WXDLLIMPEXP_ADV
    #define WXDLLIMPEXP_ADV WXDLLEXPORT
#endif

#ifndef DECLARE_NO_ASSIGN_CLASS
    #define DECLARE_NO_ASSIGN_CLASS(classname) \
        private:                               \
        classname& operator=(const classname&);
#endif

#ifndef WX_DECLARE_OBJARRAY_WITH_DECL
    #define WX_DECLARE_OBJARRAY_WITH_DECL(T, name, expmode) WX_DECLARE_USER_EXPORTED_OBJARRAY(T, name, WXDLLEXPORT)
#endif

#ifndef WX_DEFINE_ARRAY_WITH_DECL_PTR
    #define WX_DEFINE_ARRAY_WITH_DECL_PTR(T, name, decl) WX_DEFINE_ARRAY(T, name)
#endif

#ifndef WX_DEFINE_ARRAY_PTR
    #define WX_DEFINE_ARRAY_PTR(T, name) WX_DEFINE_ARRAY(T, name)
#endif

#ifndef DECLARE_EXPORTED_EVENT_TYPE
    #define DECLARE_EXPORTED_EVENT_TYPE(expdecl, name, value) DECLARE_LOCAL_EVENT_TYPE(name, value)
#endif

#ifndef wxStaticCastEvent
    #define wxStaticCastEvent(type, val) (type) val
#endif

#ifndef wxFULL_REPAINT_ON_RESIZE
    #define wxFULL_REPAINT_ON_RESIZE 0
#endif

// ----------------------------------------------------------------------------
#if !wxCHECK_VERSION(2, 5, 0)
    // wxMenuItemList::compatibility_iterator was wxMenuItemList::Node*
    #define compatibility_iterator Node*
#endif


#endif //__WX_WX24DEFS_H__
