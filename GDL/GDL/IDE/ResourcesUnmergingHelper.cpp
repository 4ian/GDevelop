/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#include "ResourcesUnmergingHelper.h"
#include <wx/filename.h>
#include <string>

void ResourcesUnmergingHelper::ExposeResource(std::string & resourceFilename)
{
    if ( resourceFilename.empty() ) return;

    resourceFilename = newDirectory + "/" + resourceFilename;
}

#endif
