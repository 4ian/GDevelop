/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "EventsBasedObjectVariant.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace gd {

EventsBasedObjectVariant::EventsBasedObjectVariant()
    : areaMinX(0), areaMinY(0), areaMinZ(0), areaMaxX(64), areaMaxY(64),
      areaMaxZ(64), objectsContainer(gd::ObjectsContainer::SourceType::Object) {
}

EventsBasedObjectVariant::~EventsBasedObjectVariant() {}

void EventsBasedObjectVariant::SerializeTo(SerializerElement &element) const {
  element.SetAttribute("name", name);
  element.SetAttribute("assetStoreId", GetAssetStoreId());
  element.SetIntAttribute("areaMinX", areaMinX);
  element.SetIntAttribute("areaMinY", areaMinY);
  element.SetIntAttribute("areaMinZ", areaMinZ);
  element.SetIntAttribute("areaMaxX", areaMaxX);
  element.SetIntAttribute("areaMaxY", areaMaxY);
  element.SetIntAttribute("areaMaxZ", areaMaxZ);

  objectsContainer.SerializeObjectsTo(element.AddChild("objects"));
  objectsContainer.SerializeFoldersTo(
      element.AddChild("objectsFolderStructure"));
  objectsContainer.GetObjectGroups().SerializeTo(
      element.AddChild("objectsGroups"));

  layers.SerializeLayersTo(element.AddChild("layers"));
  initialInstances.SerializeTo(element.AddChild("instances"));
}

void EventsBasedObjectVariant::UnserializeFrom(
    gd::Project &project, const SerializerElement &element) {
  name = element.GetStringAttribute("name");
  assetStoreId = element.GetStringAttribute("assetStoreId");
  areaMinX = element.GetIntAttribute("areaMinX", 0);
  areaMinY = element.GetIntAttribute("areaMinY", 0);
  areaMinZ = element.GetIntAttribute("areaMinZ", 0);
  areaMaxX = element.GetIntAttribute("areaMaxX", 64);
  areaMaxY = element.GetIntAttribute("areaMaxY", 64);
  areaMaxZ = element.GetIntAttribute("areaMaxZ", 64);

  objectsContainer.UnserializeObjectsFrom(project, element.GetChild("objects"));
  if (element.HasChild("objectsFolderStructure")) {
    objectsContainer.UnserializeFoldersFrom(
        project, element.GetChild("objectsFolderStructure", 0));
  }
  objectsContainer.AddMissingObjectsInRootFolder();
  objectsContainer.GetObjectGroups().UnserializeFrom(
      element.GetChild("objectsGroups"));

  if (element.HasChild("layers")) {
    layers.UnserializeLayersFrom(element.GetChild("layers"));
  } else {
    layers.Reset();
  }
  initialInstances.UnserializeFrom(element.GetChild("instances"));
}

} // namespace gd
