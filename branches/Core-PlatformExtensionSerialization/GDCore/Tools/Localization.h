/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef GDCORE_LOCALIZATION_H
#define GDCORE_LOCALIZATION_H

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
    #include <wx/intl.h>
    //Ensure the wxWidgets macro "_" returns a std::string
    #if defined(_)
        #undef _
    #endif
    #define _(s) std::string(wxGetTranslation((s)).mb_str())
#else
    //Ensure the internationalization macro is still defined as code rely on it:
    #define _(x) x
#endif

#endif // GDCORE_LOCALIZATION_H
