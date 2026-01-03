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
          "MyBehavior", gd::EventsFunctionsContainer::FunctionOwner::Behavior),
      sharedPropertyDescriptors(
          gd::EventsFunctionsContainer::FunctionOwner::Behavior),
      quickCustomizationVisibility(QuickCustomization::Visibility::Default) {}

void EventsBasedBehavior::SerializeTo(SerializerElement& element) const {
  AbstractEventsBasedEntity::SerializeTo(element);
  element.SetAttribute("objectType", objectType);
  if (!sharedPropertyDescriptors.empty()) {
    sharedPropertyDescriptors.SerializeElementsTo(
        "propertyDescriptor", element.AddChild("sharedPropertyDescriptors"));
    sharedPropertyDescriptors.SerializeFoldersTo(
        element.AddChild("sharedPropertyFolderStructure"));
  }
  if (quickCustomizationVisibility != QuickCustomization::Visibility::Default) {
    element.SetStringAttribute(
        "quickCustomizationVisibility",
        quickCustomizationVisibility == QuickCustomization::Visibility::Visible
            ? "visible"
            : "hidden");
  }
}

void EventsBasedBehavior::UnserializeFrom(gd::Project& project,
                                          const SerializerElement& element) {
  AbstractEventsBasedEntity::UnserializeFrom(project, element);
  objectType = element.GetStringAttribute("objectType");
  sharedPropertyDescriptors.UnserializeElementsFrom(
      "propertyDescriptor", element.GetChild("sharedPropertyDescriptors"));
  if (element.HasChild("sharedPropertiesFolderStructure")) {
    sharedPropertyDescriptors.UnserializeFoldersFrom(
        project, element.GetChild("sharedPropertiesFolderStructure", 0));
  }
  sharedPropertyDescriptors.AddMissingPropertiesInRootFolder();
  if (element.HasChild("quickCustomizationVisibility")) {
    quickCustomizationVisibility =
        element.GetStringAttribute("quickCustomizationVisibility") == "visible"
            ? QuickCustomization::Visibility::Visible
            : QuickCustomization::Visibility::Hidden;
  } else {
    quickCustomizationVisibility = QuickCustomization::Visibility::Default;
  }
}

}  // namespace gd
