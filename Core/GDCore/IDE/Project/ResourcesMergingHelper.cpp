/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "ResourcesMergingHelper.h"
#include <iostream>
#include "GDCore/CommonTools.h"
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/IDE/NewNameGenerator.h"
#include "GDCore/String.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Log.h"

namespace gd {

void ResourcesMergingHelper::ExposeFile(gd::String& resourceFilename) {
  if (resourceFilename.empty()) return;

  gd::String resourceFullFilename = resourceFilename;
  resourceFullFilename = gd::AbstractFileSystem::NormalizeSeparator(
      resourceFullFilename);  // Protect against \ on Linux.
  fs.MakeAbsolute(resourceFullFilename, baseDirectory);

  if (!preserveDirectoriesStructure)
    SetNewFilename(resourceFullFilename, fs.FileNameFrom(resourceFullFilename));
  else {
    // We want to preserve the directory structure:
    // keep paths relative to the base directory
    gd::String relativeFilename = resourceFullFilename;
    if (fs.MakeRelative(relativeFilename, baseDirectory))
      SetNewFilename(resourceFullFilename, relativeFilename);
    else  // Unless the filename cannot be made relative. In this case:
    {
      // Just strip the filename to its file part
      // if we do not want to preserve the absolute filenames.
      if (!preserveAbsoluteFilenames)
        SetNewFilename(resourceFullFilename,
                       fs.FileNameFrom(resourceFullFilename));
    }
  }

  gd::String newResourceFilename = oldFilenames[resourceFullFilename];
  resourceFilename = newResourceFilename;
}

void ResourcesMergingHelper::SetNewFilename(gd::String oldFilename,
                                            gd::String newFilename) {
  if (oldFilenames.find(oldFilename) != oldFilenames.end()) return;

  // Extract baseName and extension from the new filename
  size_t extensionPos = newFilename.find_last_of(".");
  gd::String extension =
      extensionPos != gd::String::npos
          ? newFilename.substr(extensionPos, newFilename.length())
          : "";
  gd::String baseName = newFilename.substr(0, extensionPos);

  // Make sure that the new filename is not already used. Generate a
  // new filename while there is a collision.
  // Preserving extension is important.
  gd::String finalFilename =
      gd::NewNameGenerator::Generate(
          baseName,
          [this, extension](const gd::String& newBaseName) {
            return newFilenames.find(newBaseName + extension) !=
                   newFilenames.end();
          }) +
      extension;

  oldFilenames[oldFilename] = finalFilename;
  newFilenames[finalFilename] = oldFilename;
}

void ResourcesMergingHelper::SetBaseDirectory(
    const gd::String& baseDirectory_) {
  baseDirectory = baseDirectory_;
}

}  // namespace gd
