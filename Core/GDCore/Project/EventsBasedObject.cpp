/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "EventsBasedObject.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace gd {

EventsBasedObject::EventsBasedObject()
    : AbstractEventsBasedEntity(
        "MyObject",
        gd::EventsFunctionsContainer::FunctionOwner::Object),
    isRenderedIn3D(false),
    isAnimatable(false),
    isTextContainer(false),
    isInnerAreaFollowingParentSize(false),
    isUsingLegacyInstancesRenderer(false),
    areaMinX(0),
    areaMinY(0),
    areaMinZ(0),
    areaMaxX(64),
    areaMaxY(64),
    areaMaxZ(64),
    objectsContainer(gd::ObjectsContainer::SourceType::Object) {
}

EventsBasedObject::~EventsBasedObject() {}

void EventsBasedObject::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("defaultName", defaultName);
  if (isRenderedIn3D) {
    element.SetBoolAttribute("is3D", true);
  }
  if (isAnimatable) {
    element.SetBoolAttribute("isAnimatable", true);
  }
  if (isTextContainer) {
    element.SetBoolAttribute("isTextContainer", true);
  }
  if (isInnerAreaFollowingParentSize) {
    element.SetBoolAttribute("isInnerAreaFollowingParentSize", true);
  }
  element.SetBoolAttribute("isUsingLegacyInstancesRenderer", isUsingLegacyInstancesRenderer);
  element.SetIntAttribute("areaMinX", areaMinX);
  element.SetIntAttribute("areaMinY", areaMinY);
  element.SetIntAttribute("areaMinZ", areaMinZ);
  element.SetIntAttribute("areaMaxX", areaMaxX);
  element.SetIntAttribute("areaMaxY", areaMaxY);
  element.SetIntAttribute("areaMaxZ", areaMaxZ);

  AbstractEventsBasedEntity::SerializeTo(element);
  objectsContainer.SerializeObjectsTo(element.AddChild("objects"));
  objectsContainer.SerializeFoldersTo(element.AddChild("objectsFolderStructure"));
  objectsContainer.GetObjectGroups().SerializeTo(element.AddChild("objectsGroups"));

  layers.SerializeLayersTo(element.AddChild("layers"));
  initialInstances.SerializeTo(element.AddChild("instances"));
}

void EventsBasedObject::UnserializeFrom(gd::Project& project,
                                        const SerializerElement& element) {
  defaultName = element.GetStringAttribute("defaultName");
  isRenderedIn3D = element.GetBoolAttribute("is3D", false);
  isAnimatable = element.GetBoolAttribute("isAnimatable", false);
  isTextContainer = element.GetBoolAttribute("isTextContainer", false);
  isInnerAreaFollowingParentSize =
      element.GetBoolAttribute("isInnerAreaFollowingParentSize", false);
  areaMinX = element.GetIntAttribute("areaMinX", 0);
  areaMinY = element.GetIntAttribute("areaMinY", 0);
  areaMinZ = element.GetIntAttribute("areaMinZ", 0);
  areaMaxX = element.GetIntAttribute("areaMaxX", 64);
  areaMaxY = element.GetIntAttribute("areaMaxY", 64);
  areaMaxZ = element.GetIntAttribute("areaMaxZ", 64);

  AbstractEventsBasedEntity::UnserializeFrom(project, element);
  objectsContainer.UnserializeObjectsFrom(project, element.GetChild("objects"));
  if (element.HasChild("objectsFolderStructure")) {
    objectsContainer.UnserializeFoldersFrom(project, element.GetChild("objectsFolderStructure", 0));
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
  if (element.HasChild("isUsingLegacyInstancesRenderer")) {
    isUsingLegacyInstancesRenderer =
        element.GetBoolAttribute("isUsingLegacyInstancesRenderer", false);
  }
  else {
    // Compatibility with GD <= 5.4.212
    isUsingLegacyInstancesRenderer = initialInstances.GetInstancesCount() == 0;
    // end of compatibility code
  }
}

}  // namespace gd
