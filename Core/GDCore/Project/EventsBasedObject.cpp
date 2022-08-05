/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "EventsBasedObject.h"
#include "EventsFunctionsContainer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/MakeUnique.h"
#include "GDCore/Project/Layout.h"

namespace gd {

EventsBasedObject::EventsBasedObject()
    : AbstractEventsBasedEntity("MyObject"), layout() {}
    
EventsBasedObject::EventsBasedObject(const gd::EventsBasedObject &_eventBasedObject)
        : AbstractEventsBasedEntity(_eventBasedObject),
          layout(_eventBasedObject.GetLayout().Clone()) {
}

void EventsBasedObject::SerializeTo(SerializerElement& element) const {
  AbstractEventsBasedEntity::SerializeTo(element);
}

void EventsBasedObject::UnserializeFrom(gd::Project& project,
                                          const SerializerElement& element) {
  AbstractEventsBasedEntity::UnserializeFrom(project, element);
}

}  // namespace gd
