/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "EventsBasedObject.h"
#include "GDCore/Project/Behavior.h"
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
    isUsingLegacyInstancesRenderer(false),
    variables(gd::VariablesContainer::SourceType::Prefab) {
}

EventsBasedObject::~EventsBasedObject() {}

std::vector<gd::String> EventsBasedObject::GetAllBehaviorNames() const {
  return behaviors.GetAllBehaviorNames();
}

gd::Behavior& EventsBasedObject::GetBehavior(const gd::String& name) {
  return behaviors.GetBehavior(name);
}

const gd::Behavior& EventsBasedObject::GetBehavior(
    const gd::String& name) const {
  return behaviors.GetBehavior(name);
}

bool EventsBasedObject::HasBehaviorNamed(const gd::String& name) const {
  return behaviors.HasBehaviorNamed(name);
}

void EventsBasedObject::RemoveBehavior(const gd::String& name) {
  behaviors.RemoveBehavior(name);
}

bool EventsBasedObject::RenameBehavior(const gd::String& name,
                                       const gd::String& newName) {
  return behaviors.RenameBehavior(name, newName);
}

gd::Behavior* EventsBasedObject::AddNewBehavior(const gd::Project& project,
                                                const gd::String& type,
                                                const gd::String& name) {
  return behaviors.AddNewBehavior(project, type, name);
}

void EventsBasedObject::SerializeToExternal(SerializerElement& element) const {
  element.SetAttribute("defaultName", defaultName);
  if (!assetStoreTag.empty()) {
    element.SetAttribute("assetStoreTag", assetStoreTag);
  }
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
  behaviors.SerializeTo(element.AddChild("behaviors"));
  variables.SerializeTo(element.AddChild("variables"));
  AbstractEventsBasedEntity::SerializeTo(element);
}

void EventsBasedObject::SerializeTo(SerializerElement& element) const {
  SerializeToExternal(element);
  variants.SerializeVariantsTo(element.AddChild("variants"));
}

void EventsBasedObject::UnserializeFrom(gd::Project& project,
                                        const SerializerElement& element) {
  defaultName = element.GetStringAttribute("defaultName");
  assetStoreTag = element.GetStringAttribute("assetStoreTag", "");
  isRenderedIn3D = element.GetBoolAttribute("is3D", false);
  isAnimatable = element.GetBoolAttribute("isAnimatable", false);
  isTextContainer = element.GetBoolAttribute("isTextContainer", false);
  isInnerAreaFollowingParentSize =
      element.GetBoolAttribute("isInnerAreaFollowingParentSize", false);

  defaultVariant.UnserializeFrom(project, element);
  defaultVariant.SetName("");
  behaviors.UnserializeFrom(
      project, element.GetChild("behaviors", 0, "automatisms"));
  variables.Clear();
  if (element.HasChild("variables")) {
    variables.UnserializeFrom(element.GetChild("variables"));
  }
  AbstractEventsBasedEntity::UnserializeFrom(project, element);

  if (element.HasChild("variants")) {
    variants.UnserializeVariantsFrom(project, element.GetChild("variants"));
  }

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
