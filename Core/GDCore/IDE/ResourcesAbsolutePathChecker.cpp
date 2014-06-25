/*
 * Game Develop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
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