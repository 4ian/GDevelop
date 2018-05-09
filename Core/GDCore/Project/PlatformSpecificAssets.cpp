/*
 * GDevelop Core
 * Copyright 2008-2018 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "PlatformSpecificAssets.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace gd {

gd::String PlatformSpecificAssets::badStr;

bool PlatformSpecificAssets::Has(const gd::String& platform,
                                 const gd::String& name) const {
  return assets.find(platform + "-" + name) != assets.end();
}

const gd::String& PlatformSpecificAssets::Get(const gd::String& platform,
                                              const gd::String& name) const {
  const auto& it = assets.find(platform + "-" + name);
  return it != assets.end() ? it->second : badStr;
}

void PlatformSpecificAssets::Remove(const gd::String& platform,
                                    const gd::String& name) {
  assets.erase(platform + "-" + name);
}

void PlatformSpecificAssets::Set(const gd::String& platform,
                                 const gd::String& name,
                                 const gd::String& resourceName) {
  assets[platform + "-" + name] = resourceName;
}

void PlatformSpecificAssets::SerializeTo(SerializerElement& element) const {
  for (auto& it : assets) {
    element.AddChild(it.first).SetValue(it.second);
  }
}

void PlatformSpecificAssets::UnserializeFrom(const SerializerElement& element) {
  assets.clear();

  for (auto& child : element.GetAllChildren()) {
    assets[child.first] = child.second->GetValue().GetString();
  }
}

void PlatformSpecificAssets::ExposeResources(
    gd::ArbitraryResourceWorker& worker) {
  for (auto& it : assets) {
    worker.ExposeImage(it.second);
  }
}
}  // namespace gd
