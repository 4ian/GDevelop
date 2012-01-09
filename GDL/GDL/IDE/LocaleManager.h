/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef LOCALEMANAGER_H
#define LOCALEMANAGER_H
#include <wx/intl.h>

namespace GDpriv
{

/**
 * Manage Game Develop localization stuff
 */
class GD_API LocaleManager
{
    public:
        wxLocale * locale; ///< wxWidgets locale object
        bool SetLanguage(int languageWxWidgetsId);
        void AddCatalog(std::string catalogName);

        static LocaleManager *GetInstance()
        {
            if ( !_singleton )
            {
                _singleton = new LocaleManager;
            }

            return ( static_cast<LocaleManager*>( _singleton ) );
        }

        static void DestroySingleton()
        {
            if ( _singleton )
            {
                delete _singleton;
                _singleton = 0;
            }
        }

    private:

        LocaleManager() : locale(NULL) {};
        virtual ~LocaleManager() {};

        static LocaleManager *_singleton;
};

}

#endif // LOCALEMANAGER_H
#endif
