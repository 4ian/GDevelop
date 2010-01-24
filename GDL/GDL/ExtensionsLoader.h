#ifndef EXTENSIONSLOADER_H
#define EXTENSIONSLOADER_H

#include <string>
#include <vector>

using namespace std;

/**
 * Class that load extensions and store them in extensionsManager
 */
class GD_API ExtensionsLoader
{
public:

    void LoadExtensionInManager(std::string extension);
    void LoadAllExtensionsAvailable();
    inline void SetExtensionsDir(string directory_) { directory = directory_; }
    inline string GetExtensionsDir() const { return directory; }

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

    string directory;

    static ExtensionsLoader *_singleton;
};

#endif // EXTENSIONSLOADER_H
