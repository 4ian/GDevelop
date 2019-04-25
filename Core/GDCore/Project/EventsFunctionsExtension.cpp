/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#include "EventsFunctionsExtension.h"
#include "EventsFunction.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/MakeUnique.h"

namespace gd {

EventsFunctionsExtension::EventsFunctionsExtension() {}

EventsFunctionsExtension::EventsFunctionsExtension(
    const EventsFunctionsExtension& other) {
  Init(other);
}

EventsFunctionsExtension& EventsFunctionsExtension::operator=(
    const EventsFunctionsExtension& other) {
  if (this != &other) Init(other);

  return *this;
}

void EventsFunctionsExtension::Init(const gd::EventsFunctionsExtension& other) {
  version = other.version;
  extensionNamespace = other.extensionNamespace;
  description = other.description;
  name = other.name;
  fullName = other.fullName;
  EventsFunctionsContainer::Init(other);
}

void EventsFunctionsExtension::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("version", version);
  element.SetAttribute("extensionNamespace", extensionNamespace);
  element.SetAttribute("description", description);
  element.SetAttribute("name", name);
  element.SetAttribute("fullName", fullName);

  gd::SerializerElement& eventsFunctionsElement =
      element.AddChild("eventsFunctions");
  SerializeEventsFunctionsTo(eventsFunctionsElement);
}

void EventsFunctionsExtension::UnserializeFrom(
    gd::Project& project, const SerializerElement& element) {
  version = element.GetStringAttribute("version");
  extensionNamespace = element.GetStringAttribute("extensionNamespace");
  description = element.GetStringAttribute("description");
  name = element.GetStringAttribute("name");
  fullName = element.GetStringAttribute("fullName");

  const gd::SerializerElement& eventsFunctionsElement =
      element.GetChild("eventsFunctions");
  UnserializeEventsFunctionsFrom(project, eventsFunctionsElement);
}

}  // namespace gd

#endif
