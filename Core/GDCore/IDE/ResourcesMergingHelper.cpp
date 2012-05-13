/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "ResourcesMergingHelper.h"
#include <wx/filename.h>
#include <string>

namespace gd
{

void ResourcesMergingHelper::ExposeResource(std::string & resourceFilename)
{
    //Currently, just strip the filename and add the resource, don't take care of resources with same filename.
    if ( resourcesNewFilename.find(resourceFilename) == resourcesNewFilename.end() )
        resourcesNewFilename[resourceFilename] = std::string( wxFileNameFromPath(resourceFilename).mb_str() );

    std::string newResourceFilename = resourcesNewFilename[resourceFilename];
    resourceFilename = newResourceFilename;
}

}
