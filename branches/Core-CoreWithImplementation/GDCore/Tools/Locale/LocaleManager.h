/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef LOCALEMANAGER_H
#define LOCALEMANAGER_H
#include <wx/intl.h>

namespace gd
{

/**
 * \brief Class allowing to use a common wxLocale object for GD IDE as well as for extensions.
 *
 * You may want to use this class if you have a custom translation catalog to add. See LocaleManager::AddCatalog
 *
 * \ingroup Tools
 */
class GD_CORE_API LocaleManager
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
