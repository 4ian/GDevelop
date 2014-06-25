/*
 * Game Develop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#include "ResourcesUnmergingHelper.h"
#include <string>

namespace gd
{

void gd::ResourcesUnmergingHelper::ExposeResource(std::string & resourceFilename)
{
    if ( resourceFilename.empty() ) return;

    resourceFilename = newDirectory + "/" + resourceFilename;
}

}