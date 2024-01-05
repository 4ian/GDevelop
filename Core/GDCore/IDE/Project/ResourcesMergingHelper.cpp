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

  // In the case of absolute filenames that we don't want to preserve, or
  // in the case of copying files without preserving relative folders, the new
  // names will be generated from the filename alone (with collision protection).
  auto stripToFilenameOnly = [&]() {
    fs.MakeAbsolute(resourceFullFilename, baseDirectory);
    SetNewFilename(resourceFullFilename, fs.FileNameFrom(resourceFullFilename));
    resourceFilename = newFilenames[resourceFullFilename];
  };

  // if we do not want to preserve the folders at all,
  // strip the filename to its file part.
  if (!preserveDirectoriesStructure) {
    stripToFilenameOnly();
    return;
  }

  // We want to preserve the directory structure:
  // keep paths relative to the base directory, as possible.
  if (!fs.IsAbsolute(resourceFullFilename)) {
    fs.MakeAbsolute(resourceFullFilename, baseDirectory);
    gd::String relativeFilename = resourceFullFilename;
    if (fs.MakeRelative(relativeFilename, baseDirectory)) {
      SetNewFilename(resourceFullFilename, relativeFilename);
      resourceFilename = newFilenames[resourceFullFilename];
    } else {
      // The filename cannot be made relative. Consider that it is absolute.
      // Just strip the filename to its file part
      // if we do not want to preserve the absolute filenames.
      if (!preserveAbsoluteFilenames) {
        stripToFilenameOnly();
      }
    }
  } else { // If the path is absolute, check if we want to preserve it or not.
    if (!preserveAbsoluteFilenames) {
      stripToFilenameOnly();
    }
  }
}

void ResourcesMergingHelper::SetNewFilename(gd::String oldFilename,
                                            gd::String newFilename) {
  if (newFilenames.find(oldFilename) != newFilenames.end()) return;

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
            return oldFilenames.find(newBaseName + extension) !=
                   oldFilenames.end();
          }) +
      extension;

  newFilenames[oldFilename] = finalFilename;
  oldFilenames[finalFilename] = oldFilename;
}

void ResourcesMergingHelper::SetBaseDirectory(
    const gd::String& baseDirectory_) {
  baseDirectory = baseDirectory_;
}

}  // namespace gd
