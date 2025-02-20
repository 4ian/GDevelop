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
    isRenderedIn3D(false),
    isAnimatable(false),
    isTextContainer(false),
    isInnerAreaFollowingParentSize(false),
    isUsingLegacyInstancesRenderer(false) {
}

EventsBasedObject::~EventsBasedObject() {}

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
  if (isInnerAreaFollowingParentSize) {
    element.SetBoolAttribute("isInnerAreaFollowingParentSize", true);
  }
  element.SetBoolAttribute("isUsingLegacyInstancesRenderer", isUsingLegacyInstancesRenderer);

  // The EventsBasedObjectVariant SerializeTo method override the name.
  // AbstractEventsBasedEntity::SerializeTo must be done after.
  defaultVariant.SerializeTo(element);
  AbstractEventsBasedEntity::SerializeTo(element);

  variants.SerializeVariantsTo(element.AddChild("variants"));
}

void EventsBasedObject::UnserializeFrom(gd::Project& project,
                                        const SerializerElement& element) {
  defaultName = element.GetStringAttribute("defaultName");
  isRenderedIn3D = element.GetBoolAttribute("is3D", false);
  isAnimatable = element.GetBoolAttribute("isAnimatable", false);
  isTextContainer = element.GetBoolAttribute("isTextContainer", false);
  isInnerAreaFollowingParentSize =
      element.GetBoolAttribute("isInnerAreaFollowingParentSize", false);

  defaultVariant.UnserializeFrom(project, element);
  AbstractEventsBasedEntity::UnserializeFrom(project, element);

  variants.UnserializeVariantsFrom(project, element.GetChild("variants"));

  if (element.HasChild("isUsingLegacyInstancesRenderer")) {
    isUsingLegacyInstancesRenderer =
        element.GetBoolAttribute("isUsingLegacyInstancesRenderer", false);
  }
  else {
    // Compatibility with GD <= 5.4.212
    isUsingLegacyInstancesRenderer = GetInitialInstances().GetInstancesCount() == 0;
    // end of compatibility code
  }
}

}  // namespace gd
