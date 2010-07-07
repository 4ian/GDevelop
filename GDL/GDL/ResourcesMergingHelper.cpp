#if defined(GDE)

#include "ResourcesMergingHelper.h"
#include <wx/filename.h>
#include <string>

std::string GetNewFilename(std::string resourceFilename)
{
    if ( resourcesNewFilename.find(resourceFilename) != resourcesNewFilename.end() )
        return resourcesNewFilename[resourceFilename];

    //Currently, just strip the filename and add the resource, don't take care of resources with same filename.
    resourcesNewFilename[resourceFilename] = std::string( wxFileNameFromPath(resourceFilename).mb_str() );
    return resourcesNewFilename[resourceFilename];
}

#endif
