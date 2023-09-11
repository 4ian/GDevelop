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
    : AbstractEventsBasedEntity(
        "MyBehavior",
        gd::EventsFunctionsContainer::FunctionOwner::Behavior),
        sharedPropertyDescriptors(gd::EventsFunctionsContainer::FunctionOwner::Behavior) {}

void EventsBasedBehavior::SerializeTo(SerializerElement& element) const {
  AbstractEventsBasedEntity::SerializeTo(element);
  element.SetAttribute("objectType", objectType);
  if (isPrivate) {
    element.SetBoolAttribute("private", isPrivate);
  }
  sharedPropertyDescriptors.SerializeElementsTo(
      "propertyDescriptor", element.AddChild("sharedPropertyDescriptors"));
}

void EventsBasedBehavior::UnserializeFrom(gd::Project& project,
                                          const SerializerElement& element) {
  AbstractEventsBasedEntity::UnserializeFrom(project, element);
  objectType = element.GetStringAttribute("objectType");
  isPrivate = element.GetBoolAttribute("private");
  sharedPropertyDescriptors.UnserializeElementsFrom(
      "propertyDescriptor", element.GetChild("sharedPropertyDescriptors"));
}

}  // namespace gd
