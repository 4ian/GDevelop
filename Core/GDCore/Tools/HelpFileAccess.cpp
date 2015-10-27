/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/Tools/Locale/LocaleManager.h"
#include <wx/mimetype.h> // mimetype support

namespace gd
{

HelpFileAccess * HelpFileAccess::_singleton = NULL;

wxString HelpFileAccess::GetHelpURL(wxString page) const
{
    wxString pageURL = "http://wiki.compilgames.net/doku.php/";

    //Get the language name from the current language of GDevelop
    wxString languageName = wxLocale::GetLanguageInfo(gd::LocaleManager::Get()->GetLanguage())->CanonicalName.substr(0, 2);

    //Add the language two letter code if the language is supported by the wiki.
    //Note: for "en", we don't need to add "en" to the URL.
    if(languageName == "fr" || languageName == "de" || languageName == "es" || languageName == "pt"
       || languageName == "ru" || languageName == "zh")
        pageURL += languageName + (!page.StartsWith("/") ? "/" : "" );

    //Add the page location to the URL
    pageURL += page;

    return pageURL;
}

}
#endif
