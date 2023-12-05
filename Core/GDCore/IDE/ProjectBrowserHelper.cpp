/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ProjectBrowserHelper.h"

#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/IDE/EventsFunctionTools.h"
#include "GDCore/IDE/Project/ArbitraryEventBasedBehaviorsWorker.h"
#include "GDCore/IDE/Project/ArbitraryEventsFunctionsWorker.h"
#include "GDCore/IDE/Project/ArbitraryObjectsWorker.h"
#include "GDCore/IDE/Project/ArbitraryBehaviorSharedDataWorker.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/EventsBasedObject.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/PropertiesContainer.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/ProjectScopedContainers.h"
#include "GDCore/String.h"
#include "GDCore/IDE/DependenciesAnalyzer.h"

namespace gd {

void ProjectBrowserHelper::ExposeProjectEvents(
    gd::Project &project, gd::ArbitraryEventsWorker &worker) {
  // See also gd::Project::ExposeResources for a method that traverses the whole
  // project (this time for resources).

  ExposeProjectEventsWithoutExtensions(project, worker);

  // Add events based extensions
  for (std::size_t e = 0; e < project.GetEventsFunctionsExtensionsCount();
       e++) {
    auto &eventsFunctionsExtension = project.GetEventsFunctionsExtension(e);
    ProjectBrowserHelper::ExposeEventsFunctionsExtensionEvents(project, eventsFunctionsExtension, worker);
  }
}

void ProjectBrowserHelper::ExposeProjectEventsWithoutExtensions(
    gd::Project& project, gd::ArbitraryEventsWorker& worker) {
  // Add layouts events
  for (std::size_t s = 0; s < project.GetLayoutsCount(); s++) {
    worker.Launch(project.GetLayout(s).GetEvents());
  }
  // Add external events events
  for (std::size_t s = 0; s < project.GetExternalEventsCount(); s++) {
    worker.Launch(project.GetExternalEvents(s).GetEvents());
  }
}

void ProjectBrowserHelper::ExposeLayoutEventsAndExternalEvents(
    gd::Project &project, gd::Layout &layout,
    gd::ArbitraryEventsWorker &worker) {

  // Add layouts events
  worker.Launch(layout.GetEvents());

  // Add external events events
  for (std::size_t s = 0; s < project.GetExternalEventsCount(); s++) {
    auto &externalEvents = project.GetExternalEvents(s);
    if (externalEvents.GetAssociatedLayout() == layout.GetName()) {
      worker.Launch(externalEvents.GetEvents());
    }
  }
}

void ProjectBrowserHelper::ExposeLayoutEventsAndExternalEvents(
    gd::Project &project, gd::Layout &layout,
    gd::ArbitraryEventsWorkerWithContext &worker) {
  auto projectScopedContainers =
    gd::ProjectScopedContainers::MakeNewProjectScopedContainersForProjectAndLayout(project, layout);

  // Add layouts events
  worker.Launch(layout.GetEvents(), projectScopedContainers);

  // Add external events events
  for (std::size_t s = 0; s < project.GetExternalEventsCount(); s++) {
    auto &externalEvents = project.GetExternalEvents(s);
    if (externalEvents.GetAssociatedLayout() == layout.GetName()) {
      worker.Launch(externalEvents.GetEvents(), projectScopedContainers);
    }
  }
}

void ProjectBrowserHelper::ExposeLayoutEventsAndDependencies(
    gd::Project &project, gd::Layout &layout,
    gd::ArbitraryEventsWorker &worker) {
  // Add layouts events
  worker.Launch(layout.GetEvents());

  DependenciesAnalyzer dependenciesAnalyzer(project, layout);
  bool hasCircularDependencies = !dependenciesAnalyzer.Analyze();
  if (hasCircularDependencies) {
    // The analyzer stops when it finds circular dependencies so the dependencies are not complete.
    // TODO Should the analyzer still continue to avoid side effect on thing that would not be code generation related?
    // Maybe a boolean parameter should be added?
    return;
  }
  for (const gd::String& externalEventName : dependenciesAnalyzer.GetExternalEventsDependencies()) {
    gd::ExternalEvents& externalEvents = project.GetExternalEvents(externalEventName);

    worker.Launch(externalEvents.GetEvents());
  }
  for (const gd::String& sceneName : dependenciesAnalyzer.GetScenesDependencies()) {
    gd::Layout& dependencyLayout = project.GetLayout(sceneName);
    
    worker.Launch(dependencyLayout.GetEvents());
  }
}

void ProjectBrowserHelper::ExposeProjectEvents(
    gd::Project &project, gd::ArbitraryEventsWorkerWithContext &worker) {
  // See also gd::Project::ExposeResources for a method that traverse the whole
  // project (this time for resources) and ExposeProjectEffects (this time for
  // effects).

  // Add layouts events
  for (std::size_t s = 0; s < project.GetLayoutsCount(); s++) {
    auto &layout = project.GetLayout(s);
    auto projectScopedContainers =
      gd::ProjectScopedContainers::MakeNewProjectScopedContainersForProjectAndLayout(project, layout);
    worker.Launch(layout.GetEvents(), projectScopedContainers);
  }
  // Add external events events
  for (std::size_t s = 0; s < project.GetExternalEventsCount(); s++) {
    const auto &externalEvents = project.GetExternalEvents(s);
    const gd::String &associatedLayout = externalEvents.GetAssociatedLayout();
    if (project.HasLayoutNamed(associatedLayout)) {
      auto &layout = project.GetLayout(associatedLayout);
      auto projectScopedContainers =
        gd::ProjectScopedContainers::MakeNewProjectScopedContainersForProjectAndLayout(project, layout);
      worker.Launch(project.GetExternalEvents(s).GetEvents(), projectScopedContainers);
    }
  }
  // Add events based extensions
  for (std::size_t e = 0; e < project.GetEventsFunctionsExtensionsCount();
       e++) {
    auto &eventsFunctionsExtension = project.GetEventsFunctionsExtension(e);
    ProjectBrowserHelper::ExposeEventsFunctionsExtensionEvents(project, eventsFunctionsExtension, worker);
  }
}

void ProjectBrowserHelper::ExposeEventsFunctionsExtensionEvents(
    gd::Project &project, const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    gd::ArbitraryEventsWorker &worker) {
    // Add (free) events functions
    for (auto &&eventsFunction : eventsFunctionsExtension.GetInternalVector()) {
      gd::ObjectsContainer globalObjectsAndGroups;
      gd::ObjectsContainer objectsAndGroups;
      gd::EventsFunctionTools::FreeEventsFunctionToObjectsContainer(
          project, eventsFunctionsExtension, *eventsFunction,
          globalObjectsAndGroups, objectsAndGroups);

      worker.Launch(eventsFunction->GetEvents());
    }

    // Add (behavior) events functions
    for (auto &&eventsBasedBehavior :
         eventsFunctionsExtension.GetEventsBasedBehaviors()
             .GetInternalVector()) {
      ExposeEventsBasedBehaviorEvents(project, *eventsBasedBehavior, worker);
    }

    // Add (object) events functions
    for (auto &&eventsBasedObject :
         eventsFunctionsExtension.GetEventsBasedObjects().GetInternalVector()) {
      ExposeEventsBasedObjectEvents(project, *eventsBasedObject, worker);
    }
}

void ProjectBrowserHelper::ExposeEventsFunctionsExtensionEvents(
    gd::Project &project, const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    gd::ArbitraryEventsWorkerWithContext &worker) {
    // Add (free) events functions
    for (auto &&eventsFunction : eventsFunctionsExtension.GetInternalVector()) {
      gd::ObjectsContainer globalObjectsAndGroups;
      gd::ObjectsContainer objectsAndGroups;
      gd::EventsFunctionTools::FreeEventsFunctionToObjectsContainer(
          project, eventsFunctionsExtension, *eventsFunction,
          globalObjectsAndGroups, objectsAndGroups);
      auto projectScopedContainers =
        gd::ProjectScopedContainers::MakeNewProjectScopedContainersFor(globalObjectsAndGroups, objectsAndGroups);
      projectScopedContainers.AddParameters(eventsFunction->GetParametersForEvents(eventsFunctionsExtension));

      worker.Launch(eventsFunction->GetEvents(), projectScopedContainers);
    }

    // Add (behavior) events functions
    for (auto &&eventsBasedBehavior :
         eventsFunctionsExtension.GetEventsBasedBehaviors()
             .GetInternalVector()) {
      ExposeEventsBasedBehaviorEvents(project, *eventsBasedBehavior, worker);
    }

    // Add (object) events functions
    for (auto &&eventsBasedObject :
         eventsFunctionsExtension.GetEventsBasedObjects().GetInternalVector()) {
      ExposeEventsBasedObjectEvents(project, *eventsBasedObject, worker);
    }
}

void ProjectBrowserHelper::ExposeEventsBasedBehaviorEvents(
    gd::Project &project, const gd::EventsBasedBehavior &eventsBasedBehavior,
    gd::ArbitraryEventsWorker &worker) {
  auto &behaviorEventsFunctions = eventsBasedBehavior.GetEventsFunctions();
  for (auto &&eventsFunction : behaviorEventsFunctions.GetInternalVector()) {
    worker.Launch(eventsFunction->GetEvents());
  }
}

void ProjectBrowserHelper::ExposeEventsBasedBehaviorEvents(
    gd::Project &project, const gd::EventsBasedBehavior &eventsBasedBehavior,
    gd::ArbitraryEventsWorkerWithContext &worker) {
  auto &behaviorEventsFunctions = eventsBasedBehavior.GetEventsFunctions();
  for (auto &&eventsFunction : behaviorEventsFunctions.GetInternalVector()) {
    gd::ObjectsContainer globalObjectsAndGroups;
    gd::ObjectsContainer objectsAndGroups;
    gd::EventsFunctionTools::BehaviorEventsFunctionToObjectsContainer(
        project, eventsBasedBehavior, *eventsFunction, globalObjectsAndGroups,
        objectsAndGroups);
    auto projectScopedContainers =
      gd::ProjectScopedContainers::MakeNewProjectScopedContainersFor(globalObjectsAndGroups, objectsAndGroups);
    projectScopedContainers.AddPropertiesContainer(eventsBasedBehavior.GetSharedPropertyDescriptors());
    projectScopedContainers.AddPropertiesContainer(eventsBasedBehavior.GetPropertyDescriptors());
    projectScopedContainers.AddParameters(eventsFunction->GetParametersForEvents(eventsBasedBehavior.GetEventsFunctions()));

    worker.Launch(eventsFunction->GetEvents(), projectScopedContainers);
  }
}

void ProjectBrowserHelper::ExposeEventsBasedObjectEvents(
    gd::Project &project, const gd::EventsBasedObject &eventsBasedObject,
    gd::ArbitraryEventsWorker &worker) {
  auto &objectEventsFunctions = eventsBasedObject.GetEventsFunctions();
  for (auto &&eventsFunction : objectEventsFunctions.GetInternalVector()) {
    gd::ObjectsContainer globalObjectsAndGroups;
    gd::ObjectsContainer objectsAndGroups;
    gd::EventsFunctionTools::ObjectEventsFunctionToObjectsContainer(
        project, eventsBasedObject, *eventsFunction, globalObjectsAndGroups,
        objectsAndGroups);

    worker.Launch(eventsFunction->GetEvents());
  }
}

void ProjectBrowserHelper::ExposeEventsBasedObjectEvents(
    gd::Project &project, const gd::EventsBasedObject &eventsBasedObject,
    gd::ArbitraryEventsWorkerWithContext &worker) {
  auto &objectEventsFunctions = eventsBasedObject.GetEventsFunctions();
  for (auto &&eventsFunction : objectEventsFunctions.GetInternalVector()) {
    gd::ObjectsContainer globalObjectsAndGroups;
    gd::ObjectsContainer objectsAndGroups;
    gd::EventsFunctionTools::ObjectEventsFunctionToObjectsContainer(
        project, eventsBasedObject, *eventsFunction, globalObjectsAndGroups,
        objectsAndGroups);
    auto projectScopedContainers =
      gd::ProjectScopedContainers::MakeNewProjectScopedContainersFor(globalObjectsAndGroups, objectsAndGroups);
    projectScopedContainers.AddPropertiesContainer(eventsBasedObject.GetPropertyDescriptors());
    projectScopedContainers.AddParameters(eventsFunction->GetParametersForEvents(eventsBasedObject.GetEventsFunctions()));

    worker.Launch(eventsFunction->GetEvents(), projectScopedContainers);
  }
}

void ProjectBrowserHelper::ExposeProjectObjects(
    gd::Project &project, gd::ArbitraryObjectsWorker &worker) {

  // Global objects
  worker.Launch(project);

  // Layout objects
  for (size_t i = 0; i < project.GetLayoutsCount(); i++) {
    gd::ProjectBrowserHelper::ExposeLayoutObjects(project.GetLayout(i), worker);
  }

  // Event based objects children
  for (std::size_t e = 0; e < project.GetEventsFunctionsExtensionsCount();
       e++) {
    auto &eventsFunctionsExtension = project.GetEventsFunctionsExtension(e);

    for (auto &&eventsBasedObjectUniquePtr :
         eventsFunctionsExtension.GetEventsBasedObjects().GetInternalVector()) {
      auto eventsBasedObject = eventsBasedObjectUniquePtr.get();
      worker.Launch(*eventsBasedObject);
    }
  }
};

void ProjectBrowserHelper::ExposeLayoutObjects(gd::Layout &layout,
                                  gd::ArbitraryObjectsWorker &worker) {
  // In the future, layouts may have children object containers.

  // Layout objects
  worker.Launch(layout);
}

void ProjectBrowserHelper::ExposeProjectFunctions(
    gd::Project &project, gd::ArbitraryEventsFunctionsWorker &worker) {

  for (std::size_t e = 0; e < project.GetEventsFunctionsExtensionsCount();
       e++) {
    auto &eventsFunctionsExtension = project.GetEventsFunctionsExtension(e);
    worker.Launch(eventsFunctionsExtension);

    for (auto &&eventsBasedBehavior :
         eventsFunctionsExtension.GetEventsBasedBehaviors()
             .GetInternalVector()) {
      worker.Launch(eventsBasedBehavior->GetEventsFunctions());
    }

    for (auto &&eventsBasedObject :
         eventsFunctionsExtension.GetEventsBasedObjects().GetInternalVector()) {
      worker.Launch(eventsBasedObject->GetEventsFunctions());
    }
  }
};

void ProjectBrowserHelper::ExposeProjectEventBasedBehaviors(
    gd::Project &project, gd::ArbitraryEventBasedBehaviorsWorker &worker) {
  for (std::size_t e = 0; e < project.GetEventsFunctionsExtensionsCount();
       e++) {
    auto &eventsFunctionsExtension = project.GetEventsFunctionsExtension(e);
    worker.Launch(eventsFunctionsExtension.GetEventsBasedBehaviors());
  }
}

void ProjectBrowserHelper::ExposeProjectSharedDatas(
    gd::Project &project, gd::ArbitraryBehaviorSharedDataWorker &worker) {
  for (std::size_t i = 0; i < project.GetLayoutsCount(); ++i) {
    gd::Layout &layout = project.GetLayout(i);
    worker.Launch(layout.GetAllBehaviorSharedData());
  }
}

} // namespace gd
