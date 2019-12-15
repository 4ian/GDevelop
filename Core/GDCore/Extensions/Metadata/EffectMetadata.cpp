/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "EffectMetadata.h"

namespace gd {

EffectMetadata::EffectMetadata(const gd::String& type_)
    : type(type_) {}

EffectMetadata& EffectMetadata::SetIncludeFile(const gd::String& includeFile) {
#if defined(GD_IDE_ONLY)
  includeFiles.clear();
  includeFiles.push_back(includeFile);
#endif
  return *this;
}

EffectMetadata& EffectMetadata::AddIncludeFile(const gd::String& includeFile) {
#if defined(GD_IDE_ONLY)
  if (std::find(includeFiles.begin(), includeFiles.end(), includeFile) ==
      includeFiles.end())
    includeFiles.push_back(includeFile);
#endif
  return *this;
}

}  // namespace gd
