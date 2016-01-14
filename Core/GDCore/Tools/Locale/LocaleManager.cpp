/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <locale.h>
#include "GDCore/Tools/Locale/LocaleManager.h"
#include "GDCore/Tools/Log.h"

namespace gd
{

LocaleManager * LocaleManager::_singleton = 0;

bool LocaleManager::SetLanguage(int languageWxWidgetsId_)
{
    languageWxWidgetsId = languageWxWidgetsId_;

    if ( locale ) delete locale;
    locale = new wxLocale;
    locale->Init(languageWxWidgetsId);
    wxLogNull noLog;
    wxLocale::AddCatalogLookupPathPrefix(wxT("."));
    wxLocale::AddCatalogLookupPathPrefix(wxT(".."));
    wxLocale::AddCatalogLookupPathPrefix(_T("locale"));
    locale->AddCatalog(_T("wxstd"));   //wxWidgets specific translations
    locale->AddCatalog(_T("GD"));      //Application translations

    wxSetlocale(LC_NUMERIC, "C"); // This sets the decimal point to be '.', whatever the language defined.

    return true;
}

void LocaleManager::AddCatalog(gd::String catalogName)
{
    if ( locale )
        locale->AddCatalog(catalogName);
}

void LocaleManager::AddPath(gd::String path)
{
    wxLogNull noLog;
    wxLocale::AddCatalogLookupPathPrefix(path);
}

}
#endif
