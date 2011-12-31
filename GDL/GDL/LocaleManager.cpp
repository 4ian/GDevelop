/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)
#include "LocaleManager.h"
#include <wx/log.h>

namespace GDpriv
{

LocaleManager * LocaleManager::_singleton = 0;

bool LocaleManager::SetLanguage(int languageWxWidgetsId)
{
    if ( locale ) delete locale;
    locale = new wxLocale;
    locale->Init(languageWxWidgetsId);
    wxLogNull noLog;
    wxLocale::AddCatalogLookupPathPrefix(wxT("."));
    wxLocale::AddCatalogLookupPathPrefix(wxT(".."));
    wxLocale::AddCatalogLookupPathPrefix(_T("locale"));
    wxLocale::AddCatalogLookupPathPrefix(_T("Extensions"));
    locale->AddCatalog(_T("GD"));      //Application translations
    locale->AddCatalog(_T("wxstd"));   //wxWidgets specific translations

    wxSetlocale(LC_NUMERIC, "C"); // This sets the decimal point to be '.', whatever the language defined.

    return true;
}

void LocaleManager::AddCatalog(std::string catalogName)
{
    if ( locale )
        locale->AddCatalog(catalogName);
}

}

#endif
