/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GDE)

#include "ResourcesUnmergingHelper.h"
#include <wx/filename.h>
#include <string>

std::string ResourcesUnmergingHelper::GetNewFilename(std::string resourceFilename)
{
    if ( resourcesNewFilename.find(resourceFilename) != resourcesNewFilename.end() )
        return resourcesNewFilename[resourceFilename];

    //Currently, just strip the filename and add the resource, don't take care of resources with same filename.
    resourcesNewFilename[resourceFilename] = newDirectory + "/" + resourceFilename;
    return resourcesNewFilename[resourceFilename];
}

#endif
