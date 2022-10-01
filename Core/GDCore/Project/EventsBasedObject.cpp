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
    : AbstractEventsBasedEntity("MyObject"), ObjectsContainer() {
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

  AbstractEventsBasedEntity::SerializeTo(element);
  SerializeObjectsTo(element.AddChild("objects"));
}

void EventsBasedObject::UnserializeFrom(gd::Project& project,
                                          const SerializerElement& element) {
  defaultName = element.GetStringAttribute("defaultName");

  AbstractEventsBasedEntity::UnserializeFrom(project, element);
  UnserializeObjectsFrom(project, element.GetChild("objects"));
}

}  // namespace gd
