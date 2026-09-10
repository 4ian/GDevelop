/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "EventsFunctionsExtensionExtractor.h"

#include "GDCore/Extensions/Metadata/BehaviorMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/WholeProjectRefactorer.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/EventsFunction.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"

namespace gd {

EventsBasedBehavior &
EventsFunctionsExtensionExtractor::CreateCustomBehaviorForObject(
    const gd::Project &project,
    gd::EventsFunctionsExtension &eventsFunctionsExtension,
    gd::Object &object) {
  auto &eventsBasedBehavior =
      eventsFunctionsExtension.GetEventsBasedBehaviors().InsertNew(
          object.GetName() + "Behavior", 0);
  eventsBasedBehavior.SetObjectType(object.GetType());
  for (const auto &behaviorName : object.GetAllBehaviorNames()) {
    auto &behavior = object.GetBehavior(behaviorName);

    auto &behaviorMetadata = gd::MetadataProvider::GetBehaviorMetadata(
        project.GetCurrentPlatform(), behavior.GetTypeName());
    if (behaviorMetadata.IsHidden()) {
      // Skip default behaviors aka capabilities.
      continue;
    }
    auto &behaviorProperty =
        eventsBasedBehavior.GetPropertyDescriptors().InsertNew(behaviorName);
    behaviorProperty.SetType("Behavior");
    behaviorProperty.AddExtraInfo(behavior.GetTypeName());

    behaviorProperty.SetLabel(behaviorMetadata.GetFullName());
  }
  eventsBasedBehavior.GetEventsFunctions().InsertNewEventsFunction(
      "doStepPreEvents", 0);
  gd::WholeProjectRefactorer::EnsureBehaviorEventsFunctionsProperParameters(
      eventsFunctionsExtension, eventsBasedBehavior);
  return eventsBasedBehavior;
}

} // namespace gd
