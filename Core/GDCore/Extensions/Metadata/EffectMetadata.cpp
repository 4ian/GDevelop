/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "EffectMetadata.h"

namespace gd {

EffectMetadata& EffectMetadata::SetIncludeFile(const gd::String& includeFile) {
  includeFiles.clear();
  includeFiles.push_back(includeFile);
  return *this;
}

EffectMetadata& EffectMetadata::AddIncludeFile(const gd::String& includeFile) {
  if (std::find(includeFiles.begin(), includeFiles.end(), includeFile) ==
      includeFiles.end())
    includeFiles.push_back(includeFile);
  return *this;
}

}  // namespace gd
