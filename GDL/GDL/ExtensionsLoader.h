#ifndef EXTENSIONSLOADER_H
#define EXTENSIONSLOADER_H

#include <string>
#include <vector>
#include "GDL/DynamicLibrariesTools.h"

namespace GDpriv
{

/**
 * Class that load static extensions ( only ) and store them in ExtensionsManager
 */
class GD_API ExtensionsLoader
{
public:

    /**
     * Load all extensions located in the extensions directory.
     * Extensions files must have extensions *.xgd(w|l)(e),
     * w for Windows, l for Linux, e for Edittime extensions.
     */
    void LoadAllStaticExtensionsAvailable();

    /**
     * Change extensions files search path.
     */
    inline void SetExtensionsDir(std::string directory_) { directory = directory_; }

    /**
     * Get extensions files search path.
     */
    inline std::string GetExtensionsDir() const { return directory; }

    static ExtensionsLoader *getInstance()
    {
        if ( NULL == _singleton )
        {
            _singleton = new ExtensionsLoader;
        }

        return ( static_cast<ExtensionsLoader*>( _singleton ) );
    }

    static void kill()
    {
        if ( NULL != _singleton )
        {
            delete _singleton;
            _singleton = NULL;
        }
    }

private:
    ExtensionsLoader();
    virtual ~ExtensionsLoader();

    void LoadStaticExtensionInManager(std::string fullpath);

    std::string directory; ///< Search directory when loading all extensions

    static ExtensionsLoader *_singleton;
};

}

#endif // EXTENSIONSLOADER_H
