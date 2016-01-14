/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "ResourcesMergingHelper.h"
#include "GDCore/String.h"
#include <iostream>
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/IDE/NewNameGenerator.h"

namespace gd
{

void ResourcesMergingHelper::ExposeFile(gd::String & resourceFilename)
{
    if ( resourceFilename.empty() ) return;

    gd::String resourceFullFilename = resourceFilename;
    resourceFullFilename = gd::AbstractFileSystem::NormalizeSeparator(resourceFullFilename); //Protect against \ on Linux.
    fs.MakeAbsolute(resourceFullFilename, baseDirectory);

    if (!preserveDirectoriesStructure)
        SetNewFilename(resourceFullFilename, fs.FileNameFrom(resourceFullFilename));
    else
    {
        //We want to preserve the directory structure:
        //keep paths relative to the base directory
        gd::String relativeFilename = resourceFullFilename;
        if ( fs.MakeRelative(relativeFilename, baseDirectory) )
            SetNewFilename(resourceFullFilename, relativeFilename);
        else //Unless the filename cannot be made relative. In this case:
        {
            //Just strip the filename to its file part
            //if we do not want to preserve the absolute filenames.
            if (!preserveAbsoluteFilenames)
                SetNewFilename(resourceFullFilename, fs.FileNameFrom(resourceFullFilename));
        }
    }

    gd::String newResourceFilename = oldFilenames[resourceFullFilename];
    resourceFilename = newResourceFilename;
}

void ResourcesMergingHelper::SetNewFilename(gd::String oldFilename, gd::String newFilename)
{
    if (oldFilenames.find(oldFilename) != oldFilenames.end())
        return;

    //Make sure that the new filename is not already used.
    gd::String finalFilename = gd::NewNameGenerator::Generate(newFilename, [this](const gd::String & name) {
        return newFilenames.find(name) != newFilenames.end();
    });

    oldFilenames[oldFilename] = finalFilename;
    newFilenames[finalFilename] = oldFilename;
}

void ResourcesMergingHelper::SetBaseDirectory(const gd::String & baseDirectory_)
{
    baseDirectory = baseDirectory_;
}

}
