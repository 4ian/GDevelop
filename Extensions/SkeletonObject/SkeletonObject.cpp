
/**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/

#include "SkeletonObject.h"
#include <SFML/Graphics.hpp>
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/String.h"
#include "GDCore/Tools/Localization.h"
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/Runtime/ImageManager.h"
#include "GDCpp/Runtime/Project/InitialInstance.h"
#include "GDCpp/Runtime/Project/Object.h"
#include "GDCpp/Runtime/Project/Project.h"
#include "GDCpp/Runtime/ResourcesLoader.h"
#include "GDCpp/Runtime/Serialization/Serializer.h"
#include "GDCpp/Runtime/Serialization/SerializerElement.h"

#include <iostream>

SkeletonObject::SkeletonObject(gd::String name_) : Object(name_) {
#if defined(GD_IDE_ONLY)
  originalSize = sf::Vector2f(32.0f, 32.0f),
  originOffset = sf::Vector2f(16.0f, 16.0f), sizeDirty = true;
#endif
}

void SkeletonObject::DoUnserializeFrom(gd::Project& project,
                                       const gd::SerializerElement& element) {
  skeletalDataFilename = element.GetStringAttribute("skeletalDataFilename");
  rootArmatureName = element.GetStringAttribute("rootArmatureName");
  textureDataFilename = element.GetStringAttribute("textureDataFilename");
  textureName = element.GetStringAttribute("textureName");
  apiName = element.GetStringAttribute("apiName");
  debugPolygons = element.GetBoolAttribute("debugPolygons", false);
}

#if defined(GD_IDE_ONLY)
void SkeletonObject::DoSerializeTo(gd::SerializerElement& element) const {
  element.SetAttribute("skeletalDataFilename", skeletalDataFilename);
  element.SetAttribute("rootArmatureName", rootArmatureName);
  element.SetAttribute("textureDataFilename", textureDataFilename);
  element.SetAttribute("textureName", textureName);
  element.SetAttribute("apiName", apiName);
  element.SetAttribute("debugPolygons", debugPolygons);
}

std::map<gd::String, gd::PropertyDescriptor> SkeletonObject::GetProperties(
    gd::Project& project) const {
  std::map<gd::String, gd::PropertyDescriptor> properties;
  properties[_("Skeletal data filename")]
      .SetValue(skeletalDataFilename)
      .SetType("resource")
      .AddExtraInfo("json");
  properties[_("Main armature name")].SetValue(rootArmatureName);
  properties[_("Texture data filename")]
      .SetValue(textureDataFilename)
      .SetType("resource")
      .AddExtraInfo("json");
  properties[_("Texture")]
      .SetValue(textureName)
      .SetType("resource")
      .AddExtraInfo("image");
  properties[_("API")].SetValue(apiName).SetType("Choice").AddExtraInfo(
      "DragonBones");
  properties[_("Debug Polygons")]
      .SetValue(debugPolygons ? "true" : "false")
      .SetType("Boolean");

  return properties;
}

bool SkeletonObject::UpdateProperty(const gd::String& name,
                                    const gd::String& value,
                                    gd::Project& project) {
  if (name == _("Skeletal data filename")) {
    skeletalDataFilename = value;
    sizeDirty = true;
  }
  if (name == _("Main armature name")) {
    rootArmatureName = value;
    sizeDirty = true;
  }
  if (name == _("Texture data filename")) textureDataFilename = value;
  if (name == _("Texture")) textureName = value;
  if (name == _("API")) apiName = value;
  if (name == _("Debug Polygons")) debugPolygons = value == "1";

  return true;
}
#endif

gd::Object* CreateSkeletonObject(gd::String name) {
  return new SkeletonObject(name);
}
