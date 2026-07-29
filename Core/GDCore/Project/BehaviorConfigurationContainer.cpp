/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/BehaviorConfigurationContainer.h"
#include <iostream>
#include <set>
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"

namespace gd {

namespace {

void OverlaySerializerElement(gd::SerializerElement& target,
                              const gd::SerializerElement& source) {
  // Scalars and arrays are complete authored values. Objects can be overlaid,
  // but a source/target type mismatch must replace the default value.
  if (source.ConsideredAsArray() || !source.IsValueUndefined() ||
      target.ConsideredAsArray() || !target.IsValueUndefined()) {
    target = source;
    return;
  }

  // Attributes and children serialize to the same JSON object. Store incoming
  // attributes as children so their generic SerializerValue type is preserved.
  for (const auto& attribute : source.GetAllAttributes()) {
    target.RemoveAttribute(attribute.first);
    target.RemoveChild(attribute.first);
    target.AddChild(attribute.first).SetValue(attribute.second);
  }

  std::set<gd::String> processedChildNames;
  for (const auto& childEntry : source.GetAllChildren()) {
    const gd::String& childName = childEntry.first;
    if (!childEntry.second ||
        processedChildNames.find(childName) != processedChildNames.end()) {
      continue;
    }
    processedChildNames.insert(childName);

    const std::size_t sourceChildrenCount =
        source.GetChildrenCount(childName);
    const bool canRecursivelyOverlay =
        !childName.empty() && sourceChildrenCount == 1 &&
        !childEntry.second->ConsideredAsArray() &&
        childEntry.second->IsValueUndefined() &&
        target.GetChildrenCount(childName) == 1 &&
        !target.GetChild(childName).ConsideredAsArray() &&
        target.GetChild(childName).IsValueUndefined();
    if (canRecursivelyOverlay) {
      target.RemoveAttribute(childName);
      OverlaySerializerElement(target.GetChild(childName),
                               *childEntry.second);
      continue;
    }

    target.RemoveAttribute(childName);
    target.RemoveChild(childName);
    for (const auto& replacementChild : source.GetAllChildren()) {
      if (replacementChild.first == childName && replacementChild.second) {
        target.AddChild(childName) = *replacementChild.second;
      }
    }
  }
}

}  // namespace

BehaviorConfigurationContainer::~BehaviorConfigurationContainer(){};

void BehaviorConfigurationContainer::UnserializeFromWithDefaultContent(
    const gd::SerializerElement& element) {
  OverlaySerializerElement(content, element);
}

std::map<gd::String, gd::PropertyDescriptor> BehaviorConfigurationContainer::GetProperties() const {
  return GetProperties(content);
}

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
