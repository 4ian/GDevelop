/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef EXTENSIONSLOADER_H
#define EXTENSIONSLOADER_H
#include <string>
#include <vector>
namespace gd { class Platform; }

namespace gd
{

/**
 * \brief Internal class loading static extensions.
 *
 * Class that load extensions and store them in ExtensionsManager
 * \see ExtensionsManager
 */
class GD_CORE_API ExtensionsLoader
{
public:

    /**
     * \brief Load all extensions located in the extensions directory for a platform.
     *
     * \param directory The directory where extensions must be searched.
     * \param platform The platform the extensions belongs to.
     *
     * \note Extensions files must have extensions *.xgd(w|l|m)(e),
     * w for Windows, l for Linux, m for Mac, e for Edittime extensions.
     */
    static void LoadAllExtensions(const std::string & directory, gd::Platform & platform);

    /**
     * \brief Load an extension from a file and add it to a platform.
     *
     * \param fullpath The fullpath to the extension file.
     * \param platform The platform the extension belongs to.
     */
    static void LoadExtension(const std::string & fullpath, gd::Platform & platform);

private:
    ExtensionsLoader() {};
    virtual ~ExtensionsLoader() {};
};

}

#endif // EXTENSIONSLOADER_H

