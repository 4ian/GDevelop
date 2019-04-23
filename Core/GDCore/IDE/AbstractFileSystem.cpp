/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "AbstractFileSystem.h"
#include "GDCore/CommonTools.h"
#include "GDCore/String.h"

namespace gd {

AbstractFileSystem::~AbstractFileSystem() {}

// TODO: Use const ref to filename to avoid copy
gd::String gd::AbstractFileSystem::NormalizeSeparator(gd::String filename) {
  // Convert all backslash to slashs.
  return filename.FindAndReplace("\\", "/");
}

}  // namespace gd
