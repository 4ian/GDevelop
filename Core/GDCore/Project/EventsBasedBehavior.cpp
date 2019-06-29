/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#include "EventsBasedBehavior.h"
#include "EventsFunctionsContainer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/MakeUnique.h"

namespace gd {

EventsBasedBehavior::EventsBasedBehavior()
    : name("MyBehavior"), fullName("") {}

void EventsBasedBehavior::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("description", description);
  element.SetAttribute("name", name);
  element.SetAttribute("fullName", fullName);
  element.SetAttribute("objectType", objectType);

  gd::SerializerElement& eventsFunctionsElement =
      element.AddChild("eventsFunctions");
  eventsFunctionsContainer.SerializeEventsFunctionsTo(eventsFunctionsElement);
  propertyDescriptors.SerializeElementsTo(
      "propertyDescriptor", element.AddChild("propertyDescriptors"));
}

void EventsBasedBehavior::UnserializeFrom(gd::Project& project,
                                          const SerializerElement& element) {
  description = element.GetStringAttribute("description");
  name = element.GetStringAttribute("name");
  fullName = element.GetStringAttribute("fullName");
  objectType = element.GetStringAttribute("objectType");

  const gd::SerializerElement& eventsFunctionsElement =
      element.GetChild("eventsFunctions");
  eventsFunctionsContainer.UnserializeEventsFunctionsFrom(
      project, eventsFunctionsElement);
  propertyDescriptors.UnserializeElementsFrom(
      "propertyDescriptor", element.GetChild("propertyDescriptors"));
}

}  // namespace gd

#endif
