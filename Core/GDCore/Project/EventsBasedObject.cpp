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
    ObjectsContainer(),
    isRenderedIn3D(false),
    isAnimatable(false),
    isTextContainer(false) {
}

EventsBasedObject::~EventsBasedObject() {}

EventsBasedObject::EventsBasedObject(const gd::EventsBasedObject &_eventBasedObject)
        : AbstractEventsBasedEntity(_eventBasedObject) {
  // TODO Add a copy constructor in ObjectsContainer.
  initialObjects = gd::Clone(_eventBasedObject.initialObjects);
  objectGroups = _eventBasedObject.objectGroups;
}

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

  AbstractEventsBasedEntity::SerializeTo(element);
  SerializeObjectsTo(element.AddChild("objects"));
  SerializeFoldersTo(element.AddChild("objectsFolderStructure"));
}

void EventsBasedObject::UnserializeFrom(gd::Project& project,
                                        const SerializerElement& element) {
  defaultName = element.GetStringAttribute("defaultName");
  isRenderedIn3D = element.GetBoolAttribute("is3D", false);
  isAnimatable = element.GetBoolAttribute("isAnimatable", false);
  isTextContainer = element.GetBoolAttribute("isTextContainer", false);

  AbstractEventsBasedEntity::UnserializeFrom(project, element);
  UnserializeObjectsFrom(project, element.GetChild("objects"));
  if (element.HasChild("objectsFolderStructure")) {
    UnserializeFoldersFrom(project, element.GetChild("objectsFolderStructure", 0));
  }
  AddMissingObjectsInRootFolder();
}

}  // namespace gd
