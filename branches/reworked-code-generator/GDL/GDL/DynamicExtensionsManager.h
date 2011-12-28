/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef DYNAMICEXTENSIONSMANAGER_H
#define DYNAMICEXTENSIONSMANAGER_H

#if !defined(GD_NO_DYNAMIC_EXTENSIONS)

#include <vector>
#include <map>
#include <string>
#include <boost/shared_ptr.hpp>
#include "GDL/DynamicExtensionBase.h"
#include "GDL/DynamicLibrariesTools.h"

/**
 * \brief Contains classes meant to be used only internally by Game Develop
 */
namespace GDpriv
{

/**
 * \brief Manages dynamic extensions.
 * Unlike static ExtensionsManager, DynamicExtensionsManager load itself the libraries.
 */
class GD_API DynamicExtensionsManager
{
    public:
        /**
         * Load a dynamic extension.
         */
        bool LoadDynamicExtension(std::string fullpath);

        /**
         * Unload all dynamic extensions.
         */
        void UnloadAllDynamicExtensions();

        bool HasEvent(std::string name) const;
        boost::shared_ptr<BaseEvent> CreateEvent(std::string name) const;

        static DynamicExtensionsManager *GetInstance()
        {
            if ( NULL == _singleton )
            {
                _singleton = new DynamicExtensionsManager;
            }

            return ( static_cast<DynamicExtensionsManager*>( _singleton ) );
        }

        static void DestroySingleton()
        {
            if ( NULL != _singleton )
            {
                delete _singleton;
                _singleton = NULL;
            }
        }

    private:
        DynamicExtensionsManager() {};
        virtual ~DynamicExtensionsManager() {};

        vector < std::pair<Handle, boost::shared_ptr<DynamicExtensionBase> > > dynamicExtensionsLoaded;

        static DynamicExtensionsManager *_singleton;
};

}

#endif

#endif // DYNAMICEXTENSIONSMANAGER_H
