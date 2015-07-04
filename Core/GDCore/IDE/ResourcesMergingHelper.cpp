/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "ResourcesMergingHelper.h"
#include <GDCore/Utf8String.h>
#include <iostream>
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/IDE/AbstractFileSystem.h"

namespace gd
{

void ResourcesMergingHelper::ExposeFile(gd::String & resourceFilename)
{
    if ( resourceFilename.empty() ) return;

    gd::String resourceFullFilename = resourceFilename;
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
            gd::String relativeFilename = resourceFullFilename;
            if ( fs.MakeRelative(relativeFilename, baseDirectory) )
                resourcesNewFilename[resourceFullFilename] = relativeFilename;
            else //Unless the filename cannot be made relative. In this case:
            {
                if ( !preserveAbsoluteFilenames ) //Just strip the filename to its file part if we do not want to preserve the absolute filenames.
                    resourcesNewFilename[resourceFullFilename] = fs.FileNameFrom(resourceFullFilename);
            }
        }
    }

    gd::String newResourceFilename = resourcesNewFilename[resourceFullFilename];
    resourceFilename = newResourceFilename;
}

void ResourcesMergingHelper::SetBaseDirectory(const gd::String & baseDirectory_)
{
    baseDirectory = baseDirectory_;
}

}
