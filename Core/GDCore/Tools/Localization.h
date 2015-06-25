/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef GDCORE_LOCALIZATION_H
#define GDCORE_LOCALIZATION_H

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
    #include <wx/intl.h>
 	#include "GDCore/Utf8Tools.h"
    #include "GDCore/Utf8String.h"
    //Create a new macro to return UTF8 gd::String from a translation
 	#if defined(_)
        #undef _
    #endif
    #define _(s) gd::String(wxGetTranslation(u8##s))

    #define GD_T(s) gd::utf8::FromWxString(wxGetTranslation(u8##s))
#else
    //Ensure the internationalization macro is still defined as code rely on it:
    #define GD_T(x) std::string(u8##x)
    
    //Create a new macro to return UTF8 gd::String from a translation
 	#if defined(_)
        #undef _
    #endif
    #define _(s) gd::String(wxGetTranslation(u8##s))
#endif

#endif // GDCORE_LOCALIZATION_H
