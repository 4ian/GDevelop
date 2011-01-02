/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef LOCALEMANAGER_H
#define LOCALEMANAGER_H
#include <wx/intl.h>

/**
 * Manage Game Develop localization stuff
 */
class LocaleManager
{
    public:
        wxLocale * locale; ///< wxWidgets locale object
        bool SetLanguage(int languageWxWidgetsId);

        static LocaleManager *getInstance()
        {
            if ( !_singleton )
            {
                _singleton = new LocaleManager;
            }

            return ( static_cast<LocaleManager*>( _singleton ) );
        }

        static void kill()
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

#endif // LOCALEMANAGER_H
