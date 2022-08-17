/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "EventsBasedBehavior.h"
#include "EventsFunctionsContainer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/MakeUnique.h"

namespace gd {

EventsBasedBehavior::EventsBasedBehavior()
    : AbstractEventsBasedEntity("MyBehavior") {}

void EventsBasedBehavior::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("objectType", objectType);
  AbstractEventsBasedEntity::SerializeTo(element);
}

void EventsBasedBehavior::UnserializeFrom(gd::Project& project,
                                          const SerializerElement& element) {
  objectType = element.GetStringAttribute("objectType");
  AbstractEventsBasedEntity::UnserializeFrom(project, element);
}

}  // namespace gd
