/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
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

void LocaleManager::AddCatalog(std::string catalogName)
{
    if ( locale )
        locale->AddCatalog(catalogName);
}

void LocaleManager::AddPath(std::string path)
{
    wxLogNull noLog;
    wxLocale::AddCatalogLookupPathPrefix(path);
}

}
#endif