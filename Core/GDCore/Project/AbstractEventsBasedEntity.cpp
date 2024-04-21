/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "AbstractEventsBasedEntity.h"

#include "EventsFunctionsContainer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/MakeUnique.h"

namespace gd {

AbstractEventsBasedEntity::AbstractEventsBasedEntity(
    const gd::String& _name,
    gd::EventsFunctionsContainer::FunctionOwner functionContainerSource)
    : name(_name),
      fullName(""),
      eventsFunctionsContainer(functionContainerSource),
      propertyDescriptors(functionContainerSource) {}

void AbstractEventsBasedEntity::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("description", description);
  element.SetAttribute("name", name);
  element.SetAttribute("fullName", fullName);

  gd::SerializerElement& eventsFunctionsElement =
      element.AddChild("eventsFunctions");
  eventsFunctionsContainer.SerializeEventsFunctionsTo(eventsFunctionsElement);
  propertyDescriptors.SerializeElementsTo(
      "propertyDescriptor", element.AddChild("propertyDescriptors"));
}

void AbstractEventsBasedEntity::UnserializeFrom(
    gd::Project& project, const SerializerElement& element) {
  description = element.GetStringAttribute("description");
  name = element.GetStringAttribute("name");
  fullName = element.GetStringAttribute("fullName");

  const gd::SerializerElement& eventsFunctionsElement =
      element.GetChild("eventsFunctions");
  eventsFunctionsContainer.UnserializeEventsFunctionsFrom(
      project, eventsFunctionsElement);
  propertyDescriptors.UnserializeElementsFrom(
      "propertyDescriptor", element.GetChild("propertyDescriptors"));
}

}  // namespace gd
