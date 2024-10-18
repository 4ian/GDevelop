/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/BehaviorConfigurationContainer.h"
#include <iostream>
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"

namespace gd {

BehaviorConfigurationContainer::~BehaviorConfigurationContainer(){};


std::map<gd::String, gd::PropertyDescriptor> BehaviorConfigurationContainer::GetProperties() const {
    return GetProperties(content);
  };

std::map<gd::String, gd::PropertyDescriptor> BehaviorConfigurationContainer::GetProperties(
    const gd::SerializerElement& behaviorContent) const {
  std::map<gd::String, gd::PropertyDescriptor> nothing;
  return nothing;
}

void BehaviorConfigurationContainer::ExposeResources(gd::ArbitraryResourceWorker& worker) {
  std::map<gd::String, gd::PropertyDescriptor> properties = GetProperties();

  for (auto& property : properties) {
    const String& propertyName = property.first;
    const gd::PropertyDescriptor& propertyDescriptor = property.second;

    if (propertyDescriptor.GetType().LowerCase() == "resource") {
      auto& extraInfo = propertyDescriptor.GetExtraInfo();
      const gd::String& resourceType = extraInfo.empty() ? "" : extraInfo[0];
      const gd::String& oldPropertyValue = propertyDescriptor.GetValue();

      gd::String newPropertyValue = oldPropertyValue;
      if (resourceType == "image") {
        worker.ExposeImage(newPropertyValue);
      } else if (resourceType == "audio") {
        worker.ExposeAudio(newPropertyValue);
      } else if (resourceType == "font") {
        worker.ExposeFont(newPropertyValue);
      } else if (resourceType == "video") {
        worker.ExposeVideo(newPropertyValue);
      } else if (resourceType == "json") {
        worker.ExposeJson(newPropertyValue);
      } else if (resourceType == "tilemap") {
        worker.ExposeTilemap(newPropertyValue);
      } else if (resourceType == "tileset") {
        worker.ExposeTileset(newPropertyValue);
      } else if (resourceType == "bitmapFont") {
        worker.ExposeBitmapFont(newPropertyValue);
      } else if (resourceType == "model3D") {
        worker.ExposeModel3D(newPropertyValue);
      } else if (resourceType == "atlas") {
        worker.ExposeAtlas(newPropertyValue);
      } else if (resourceType == "spine") {
        worker.ExposeSpine(newPropertyValue);
      }

      if (newPropertyValue != oldPropertyValue) {
        UpdateProperty(propertyName, newPropertyValue);
      }
    }
  }
}

}  // namespace gd
