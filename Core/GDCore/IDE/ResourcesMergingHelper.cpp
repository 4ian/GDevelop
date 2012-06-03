/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "ResourcesMergingHelper.h"
#include <wx/filename.h>
#include <string>
#include "GDCore/CommonTools.h"

namespace gd
{

void ResourcesMergingHelper::ExposeResource(std::string & resourceFilename)
{
    std::string resourceFullFilename = gd::ToString(wxFileName::FileName(resourceFilename).MakeAbsolute(baseDirectory));

    //Currently, just strip the filename and add the resource, don't take care of resources with same filename.
    if ( resourcesNewFilename.find(resourceFullFilename) == resourcesNewFilename.end() )
        resourcesNewFilename[resourceFullFilename] = std::string( wxFileNameFromPath(resourceFullFilename).mb_str() );

    std::string newResourceFilename = resourcesNewFilename[resourceFilename];
    resourceFilename = newResourceFilename;
}

void ResourcesMergingHelper::SetBaseDirectory(const std::string & baseDirectory_)
{
    baseDirectory = baseDirectory_;
}

}
