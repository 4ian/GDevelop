/*
 * GDevelop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "ResourcesMergingHelper.h"
#include <string>
#include <iostream>
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/IDE/AbstractFileSystem.h"

namespace gd
{

void ResourcesMergingHelper::ExposeFile(std::string & resourceFilename)
{
    if ( resourceFilename.empty() ) return;

    std::string resourceFullFilename = resourceFilename;
    resourceFullFilename = gd::AbstractFileSystem::NormalizeSeparator(resourceFullFilename); //Protect against \ on Linux.
    fs.MakeAbsolute(resourceFullFilename, baseDirectory);

    if (!preserveDirectoriesStructure)
    {
        //Just strip the filename and add the resource, don't take care of resources with same filename.
        if ( resourcesNewFilename.find(resourceFullFilename) == resourcesNewFilename.end() )
            resourcesNewFilename[resourceFullFilename] = fs.FileNameFrom(resourceFullFilename);

        std::cout << resourceFullFilename << " to " << resourcesNewFilename[resourceFullFilename] << std::endl;
    }
    else
    {
        if ( resourcesNewFilename.find(resourceFullFilename) == resourcesNewFilename.end() )
        {
            //We want to preserve the directory structure : Keep paths relative to the base directory
            std::string relativeFilename = resourceFullFilename;
            if ( fs.MakeRelative(relativeFilename, baseDirectory) )
                resourcesNewFilename[resourceFullFilename] = relativeFilename;
            else //Unless the filename cannot be made relative. In this case:
            {
                if ( !preserveAbsoluteFilenames ) //Just strip the filename to its file part if we do not want to preserve the absolute filenames.
                    resourcesNewFilename[resourceFullFilename] = fs.FileNameFrom(resourceFullFilename);
            }
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
