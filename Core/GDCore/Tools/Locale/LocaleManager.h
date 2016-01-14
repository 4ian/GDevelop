/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#ifndef LOCALEMANAGER_H
#define LOCALEMANAGER_H
#include "GDCore/Tools/Localization.h"

namespace gd
{

/**
 * \brief Class allowing to use a common wxLocale object for the IDE as well as for extensions.
 *
 * You may want to use this class if you have a custom translation catalog to add. See LocaleManager::AddCatalog
 *
 * \ingroup Tools
 */
class GD_CORE_API LocaleManager
{
public:
    wxLocale * locale; ///< wxWidgets locale object

    /**
     * \brief Set the language used.
     * \param languageWxWidgetsId The wxWidgets identifier of the language.
     */
    bool SetLanguage(int languageWxWidgetsId);

    /**
     * \brief Get the language used.
     * \return The wxWidgets identifier of the language used.
     */
    int GetLanguage() { return languageWxWidgetsId; }

    /**
     * \brief Add a catalog name.
     *
     * If catalog name is GD, then the file must be named GD.mo and located
     * in a search path. ( locale directory for example or xxxPlatform/Extensions/locale ).
     * \param catalogName The name of the translation catalog.
     */
    void AddCatalog(gd::String catalogName);

    /**
     * \brief Add a path where catalog are searched.
     * \param path The path, relative to the GDevelop directory.
     */
    void AddPath(gd::String path);

    static LocaleManager *Get()
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

    int languageWxWidgetsId;

    static LocaleManager *_singleton;
};

}

#endif // LOCALEMANAGER_H
#endif
