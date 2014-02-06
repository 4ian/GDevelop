/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#include "ResourcesMergingHelper.h"
#if !defined(GD_NO_WX_GUI)
#include <wx/filename.h>
#endif
#include <string>
#include <iostream>
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/Tools/Localization.h"

namespace gd
{

void ResourcesMergingHelper::ExposeResource(std::string & resourceFilename)
{
#if !defined(GD_NO_WX_GUI)
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
            else //Unless the filename cannot be made relative. In this case:
            {
                if ( !preserveAbsoluteFilenames ) //Just strip the filename to its file part if we do not want to preserve the absolute filenames.
                    resourcesNewFilename[resourceFullFilename] = std::string( wxFileNameFromPath(resourceFullFilename).mb_str() );
            }
        }
    }

    std::string newResourceFilename = resourcesNewFilename[resourceFullFilename];
    resourceFilename = newResourceFilename;
#else
    gd::LogError(_("You tried to use ResourcesMergingHelper::ExposeResource which is currently unsupported when wxwidgets support is disabled."));
#endif
}

void ResourcesMergingHelper::SetBaseDirectory(const std::string & baseDirectory_)
{
    baseDirectory = baseDirectory_;
}

}







