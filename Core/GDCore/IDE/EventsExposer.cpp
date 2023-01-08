/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "EventsExposer.h"

#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/IDE/EventsFunctionTools.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/EventsBasedObject.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"

namespace gd {

void EventsExposer::ExposeProjectEvents(
    gd::Project& project, gd::ArbitraryEventsWorker& worker) {
  // See also gd::Project::ExposeResources for a method that traverse the whole
  // project (this time for resources).

  // Add layouts events
  for (std::size_t s = 0; s < project.GetLayoutsCount(); s++) {
    worker.Launch(project.GetLayout(s).GetEvents());
  }
  // Add external events events
  for (std::size_t s = 0; s < project.GetExternalEventsCount(); s++) {
    worker.Launch(project.GetExternalEvents(s).GetEvents());
  }
  // Add events based extensions
  for (std::size_t e = 0; e < project.GetEventsFunctionsExtensionsCount();
       e++) {
    // Add (free) events functions
    auto& eventsFunctionsExtension = project.GetEventsFunctionsExtension(e);
    for (auto&& eventsFunction : eventsFunctionsExtension.GetInternalVector()) {
      worker.Launch(eventsFunction->GetEvents());
    }

    // Add (behavior) events functions
    for (auto&& eventsBasedBehavior :
         eventsFunctionsExtension.GetEventsBasedBehaviors()
             .GetInternalVector()) {
      auto& behaviorEventsFunctions = eventsBasedBehavior->GetEventsFunctions();
      for (auto&& eventsFunction :
           behaviorEventsFunctions.GetInternalVector()) {
        worker.Launch(eventsFunction->GetEvents());
      }
    }

    // Add (object) events functions
    for (auto&& eventsBasedObject :
         eventsFunctionsExtension.GetEventsBasedObjects()
             .GetInternalVector()) {
      auto& objectEventsFunctions = eventsBasedObject->GetEventsFunctions();
      for (auto&& eventsFunction :
           objectEventsFunctions.GetInternalVector()) {
        worker.Launch(eventsFunction->GetEvents());
      }
    }
  }
}

void EventsExposer::ExposeProjectEvents(
    gd::Project& project, gd::ArbitraryEventsWorkerWithContext& worker) {
  // See also gd::Project::ExposeResources for a method that traverse the whole
  // project (this time for resources) and ExposeProjectEffects (this time for
  // effects).

  // Add layouts events
  for (std::size_t s = 0; s < project.GetLayoutsCount(); s++) {
    auto& layout = project.GetLayout(s);
    worker.Launch(layout.GetEvents(), project, layout);
  }
  // Add external events events
  for (std::size_t s = 0; s < project.GetExternalEventsCount(); s++) {
    const auto& externalEvents = project.GetExternalEvents(s);
    const gd::String& associatedLayout = externalEvents.GetAssociatedLayout();
    if (project.HasLayoutNamed(associatedLayout)) {
      worker.Launch(project.GetExternalEvents(s).GetEvents(),
                    project,
                    project.GetLayout(associatedLayout));
    }
  }
  // Add events based extensions
  for (std::size_t e = 0; e < project.GetEventsFunctionsExtensionsCount();
       e++) {
    // Add (free) events functions
    auto& eventsFunctionsExtension = project.GetEventsFunctionsExtension(e);
    for (auto&& eventsFunction : eventsFunctionsExtension.GetInternalVector()) {
      gd::ObjectsContainer globalObjectsAndGroups;
      gd::ObjectsContainer objectsAndGroups;
      gd::EventsFunctionTools::FreeEventsFunctionToObjectsContainer(
          project,
          eventsFunctionsExtension,
          *eventsFunction,
          globalObjectsAndGroups,
          objectsAndGroups);

      worker.Launch(eventsFunction->GetEvents(),
                    globalObjectsAndGroups,
                    objectsAndGroups);
    }

    // Add (behavior) events functions
    for (auto&& eventsBasedBehavior :
         eventsFunctionsExtension.GetEventsBasedBehaviors()
             .GetInternalVector()) {
      ExposeEventsBasedBehaviorEvents(project, *eventsBasedBehavior, worker);
    }

    // Add (object) events functions
    for (auto&& eventsBasedObject :
         eventsFunctionsExtension.GetEventsBasedObjects()
             .GetInternalVector()) {
      ExposeEventsBasedObjectEvents(project, *eventsBasedObject, worker);
    }
  }
}

void EventsExposer::ExposeEventsBasedBehaviorEvents(
    gd::Project& project,
    const gd::EventsBasedBehavior& eventsBasedBehavior,
    gd::ArbitraryEventsWorkerWithContext& worker) {
  auto& behaviorEventsFunctions = eventsBasedBehavior.GetEventsFunctions();
  for (auto&& eventsFunction : behaviorEventsFunctions.GetInternalVector()) {
    gd::ObjectsContainer globalObjectsAndGroups;
    gd::ObjectsContainer objectsAndGroups;
    gd::EventsFunctionTools::BehaviorEventsFunctionToObjectsContainer(
        project,
        eventsBasedBehavior,
        *eventsFunction,
        globalObjectsAndGroups,
        objectsAndGroups);

    worker.Launch(
        eventsFunction->GetEvents(), globalObjectsAndGroups, objectsAndGroups);
  }
}

void EventsExposer::ExposeEventsBasedObjectEvents(
    gd::Project& project,
    const gd::EventsBasedObject& eventsBasedObject,
    gd::ArbitraryEventsWorkerWithContext& worker) {
  auto& objectEventsFunctions = eventsBasedObject.GetEventsFunctions();
  for (auto&& eventsFunction : objectEventsFunctions.GetInternalVector()) {
    gd::ObjectsContainer globalObjectsAndGroups;
    gd::ObjectsContainer objectsAndGroups;
    gd::EventsFunctionTools::ObjectEventsFunctionToObjectsContainer(
        project,
        eventsBasedObject,
        *eventsFunction,
        globalObjectsAndGroups,
        objectsAndGroups);

    worker.Launch(
        eventsFunction->GetEvents(), globalObjectsAndGroups, objectsAndGroups);
  }
}
}  // namespace gd
