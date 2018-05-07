/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "ResourcesAbsolutePathChecker.h"
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/String.h"

namespace gd {

void ResourcesAbsolutePathChecker::ExposeFile(gd::String& resourceFilename) {
  if (fs.IsAbsolute(resourceFilename)) hasAbsoluteFilenames = true;
}

}  // namespace gd
