/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "ResourcesAbsolutePathChecker.h"
#include "GDCore/IDE/AbstractFileSystem.h"
#include <string>

namespace gd
{

void ResourcesAbsolutePathChecker::ExposeFile(std::string & resourceFilename)
{
    if ( fs.IsAbsolute(resourceFilename) )
        hasAbsoluteFilenames = true;
}

}
