/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "ResourcesMergingHelper.h"
#include <wx/filename.h>
#include <string>
#include <iostream>
#include "GDCore/CommonTools.h"

namespace gd
{

void ResourcesMergingHelper::ExposeResource(std::string & resourceFilename)
{
    if ( resourceFilename.empty() ) return;

    wxFileName filename = wxFileName::FileName(resourceFilename);
    filename.MakeAbsolute(baseDirectory);
    std::string resourceFullFilename = ToString(filename.GetFullPath());

    if ( !preserveDirectoriesStructure)
    {
        //Just strip the filename and add the resource, don't take care of resources with same filename.
        if ( resourcesNewFilename.find(resourceFullFilename) == resourcesNewFilename.end() )
            resourcesNewFilename[resourceFullFilename] = std::string( wxFileNameFromPath(resourceFullFilename).mb_str() );
    }
    else
    {
        if ( resourcesNewFilename.find(resourceFullFilename) == resourcesNewFilename.end() )
        {
            //We want to preserve the directory structure : Keep paths relative to the base directory
            if ( filename.MakeRelativeTo(baseDirectory) )
                resourcesNewFilename[resourceFullFilename] = std::string( filename.GetFullPath().mb_str() );
            else //Unless the filename cannot be made relative. In this case, just keep the filename.
                resourcesNewFilename[resourceFullFilename] = std::string( wxFileNameFromPath(resourceFullFilename).mb_str() );

        }
    }

    std::string newResourceFilename = resourcesNewFilename[resourceFullFilename];
    resourceFilename = newResourceFilename;
}

void ResourcesMergingHelper::SetBaseDirectory(const std::string & baseDirectory_)
{
    baseDirectory = baseDirectory_;
}

}
