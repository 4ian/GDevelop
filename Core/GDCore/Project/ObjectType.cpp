/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ObjectType.h"
#include "EventsFunctionsContainer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/MakeUnique.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Metadata/ObjectMetadata.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Extensions/Platform.h"

namespace gd {

ObjectType::ObjectType() {}

bool ObjectType::HasCapability(const gd::String& name) const {
  return std::find(capabilities.begin(), capabilities.end(), name) !=
         capabilities.end();
}

ObjectType& ObjectType::AddCapability(const gd::String& name) {
  if (!HasCapability(name)) capabilities.push_back(name);
  return *this;
}

void ObjectType::RemoveCapability(const gd::String& name) {
  capabilities.erase(
      std::remove(capabilities.begin(), capabilities.end(), name),
      capabilities.end());
}

void ObjectType::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("objectType", name);

  SerializerElement& capabilitiesElement = element.AddChild("capabilities");
  capabilitiesElement.ConsiderAsArrayOf("object");
  for (auto& name : capabilities) {
    capabilitiesElement.AddChild("capability").SetAttribute("name", name);
  }
}

void ObjectType::UnserializeFrom(const SerializerElement& element) {
  name = element.GetStringAttribute("objectType");
  SerializerElement& capabilitiesElement = element.GetChild("capabilities");
  capabilitiesElement.ConsiderAsArrayOf("capability");
  for (std::size_t j = 0; j < capabilitiesElement.GetChildrenCount(); ++j)
    AddCapability(capabilitiesElement.GetChild(j).GetStringAttribute("name"));
}

bool ObjectType::IsMatchedBy(
  const gd::Platform& platform,
  const ObjectsContainer& globalObjectsContainer,
  const ObjectsContainer& objectsContainer,
  const gd::String& objectName) {

  gd::String objectType = gd::GetTypeOfObject(
          globalObjectsContainer,
          objectsContainer,
          objectName,
          false);

  if (!IsBaseObject() && name != objectType) {
    return false;
  }

  if (capabilities.empty()) {
    return true;
  }

  // TODO Handle groups

  auto& objectMetadata = gd::MetadataProvider::GetObjectMetadata(
    platform,
    objectType
  );

  for (auto& capability : capabilities) {
    if (!objectMetadata.IsSupportedBaseObjectCapability(capability)) {
      return false;
    }
  }
  return true;
}

}  // namespace gd
