/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#include "EventsFunctionsExtension.h"
#include "EventsFunction.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace gd {

EventsFunctionsExtension::EventsFunctionsExtension() {}

void EventsFunctionsExtension::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("version", version);
  element.SetAttribute("extensionNamespace", extensionNamespace);
  element.SetAttribute("description", description);
  element.SetAttribute("name", name);
  element.SetAttribute("fullName", fullName);

  gd::SerializerElement& eventsFunctionsElement = element.AddChild("eventsFunctions");
  eventsFunctionsElement.ConsiderAsArrayOf("eventsFunction");
  for (const auto& eventsFunction : eventsFunctions) {
    eventsFunction.SerializeTo(eventsFunctionsElement.AddChild("eventsFunction"));
  }
}

void EventsFunctionsExtension::UnserializeFrom(gd::Project& project,
                                     const SerializerElement& element) {
  version = element.GetStringAttribute("version");
  extensionNamespace = element.GetStringAttribute("extensionNamespace");
  description = element.GetStringAttribute("description");
  name = element.GetStringAttribute("name");
  fullName = element.GetStringAttribute("fullName");

  const gd::SerializerElement& eventsFunctionsElement =
      element.GetChild("eventsFunctions");
  eventsFunctions.clear();
  eventsFunctionsElement.ConsiderAsArrayOf("eventsFunction");
  for (std::size_t i = 0; i < eventsFunctionsElement.GetChildrenCount(); ++i) {
    EventsFunction eventsFunction;
    eventsFunction.UnserializeFrom(project, eventsFunctionsElement.GetChild(i));
    eventsFunctions.push_back(eventsFunction);
  }
}

}  // namespace gd

#endif
