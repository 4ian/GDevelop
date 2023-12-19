/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "ResourcesInUseHelper.h"

namespace gd {

const std::vector<gd::String> ResourcesInUseHelper::resourceTypes = {
    "image",   "audio", "font",       "json",   "tilemap",
    "tileset", "video", "bitmapFont", "model3D"};

const std::vector<gd::String> &ResourcesInUseHelper::GetAllResources() {
  allResources.clear();
  for (auto &&resourceType : gd::ResourcesInUseHelper::resourceTypes) {
    for (auto &&resourceName : GetAll(resourceType)) {
      allResources.push_back(resourceName);
    }
  }
  return allResources;
}

} // namespace gd
