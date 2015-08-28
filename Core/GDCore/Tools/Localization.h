/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef GDCORE_LOCALIZATION_H
#define GDCORE_LOCALIZATION_H

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
    #include <wx/intl.h>
    #include "GDCore/String.h"
    //Create a new macro to return UTF8 gd::String from a translation
 	#if defined(_)
        #undef _
    #endif
    #define _(s) gd::String(wxGetTranslation(wxString::FromUTF8(u8##s)))
#else
    //Create a new macro to return UTF8 gd::String from a translation
 	  #if defined(_)
        #undef _
    #endif
    #define _(s) gd::String(u8##s)
#endif

#endif // GDCORE_LOCALIZATION_H
