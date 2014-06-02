/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#include "ResourcesAbsolutePathChecker.h"
#include "GDCore/IDE/AbstractFileSystem.h"
#include <string>

namespace gd
{

void ResourcesAbsolutePathChecker::ExposeResource(std::string & resourceFilename)
{
    if ( fs.IsAbsolute(resourceFilename) )
        hasAbsoluteFilenames = true;
}

}