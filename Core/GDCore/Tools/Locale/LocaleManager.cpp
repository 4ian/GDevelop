/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDCore/Tools/Locale/LocaleManager.h"
#include <wx/log.h>

namespace gd
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
    locale->AddCatalog(_T("wxstd"));   //wxWidgets specific translations
    locale->AddCatalog(_T("GD"));      //Application translations

    wxSetlocale(LC_NUMERIC, "C"); // This sets the decimal point to be '.', whatever the language defined.

    return true;
}

void LocaleManager::AddCatalog(std::string catalogName)
{
    if ( locale )
        locale->AddCatalog(catalogName);
}

}
