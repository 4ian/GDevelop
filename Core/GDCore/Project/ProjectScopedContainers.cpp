#include "ProjectScopedContainers.h"

#include "GDCore/IDE/EventsFunctionTools.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/EventsBasedObject.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Events/Event.h"

namespace gd {

ProjectScopedContainers
ProjectScopedContainers::MakeNewProjectScopedContainersForFreeEventsFunction(
    const gd::Project &project,
      const gd::EventsFunctionsContainer &eventsFunctionsContainer,
    const gd::EventsFunction &eventsFunction,
    gd::ObjectsContainer &globalObjectsContainers,
    gd::ObjectsContainer &objectsContainers) {

    gd::EventsFunctionTools::FreeEventsFunctionToObjectsContainer(
        project, eventsFunctionsContainer, eventsFunction,
        globalObjectsContainers, objectsContainers);
    auto projectScopedContainers =
      gd::ProjectScopedContainers::MakeNewProjectScopedContainersFor(globalObjectsContainers, objectsContainers);
    projectScopedContainers.AddParameters(eventsFunction.GetParametersForEvents(eventsFunctionsContainer));

  return projectScopedContainers;
}

ProjectScopedContainers
ProjectScopedContainers::MakeNewProjectScopedContainersForBehaviorEventsFunction(
    const gd::Project &project,
    const gd::EventsBasedBehavior& eventsBasedBehavior,
    const gd::EventsFunction &eventsFunction,
    gd::ObjectsContainer &globalObjectsContainers,
    gd::ObjectsContainer &objectsContainers) {

    gd::EventsFunctionTools::BehaviorEventsFunctionToObjectsContainer(
        project, eventsBasedBehavior, eventsFunction, globalObjectsContainers,
        objectsContainers);
    auto projectScopedContainers =
      gd::ProjectScopedContainers::MakeNewProjectScopedContainersFor(globalObjectsContainers, objectsContainers);
    projectScopedContainers.AddPropertiesContainer(eventsBasedBehavior.GetSharedPropertyDescriptors());
    projectScopedContainers.AddPropertiesContainer(eventsBasedBehavior.GetPropertyDescriptors());
    projectScopedContainers.AddParameters(eventsFunction.GetParametersForEvents(eventsBasedBehavior.GetEventsFunctions()));

  return projectScopedContainers;
}

ProjectScopedContainers
ProjectScopedContainers::MakeNewProjectScopedContainersForObjectEventsFunction(
    const gd::Project &project,
    const gd::EventsBasedObject &eventsBasedObject,
    const gd::EventsFunction &eventsFunction,
    gd::ObjectsContainer &globalObjectsContainers,
    gd::ObjectsContainer &objectsContainers) {

    gd::EventsFunctionTools::ObjectEventsFunctionToObjectsContainer(
        project, eventsBasedObject, eventsFunction, globalObjectsContainers,
        objectsContainers);
    auto projectScopedContainers =
      gd::ProjectScopedContainers::MakeNewProjectScopedContainersFor(globalObjectsContainers, objectsContainers);
    projectScopedContainers.AddPropertiesContainer(eventsBasedObject.GetPropertyDescriptors());
    projectScopedContainers.AddParameters(eventsFunction.GetParametersForEvents(eventsBasedObject.GetEventsFunctions()));

  return projectScopedContainers;
}

ProjectScopedContainers
ProjectScopedContainers::MakeNewProjectScopedContainersWithLocalVariables(
    const ProjectScopedContainers &projectScopedContainers,
    const gd::BaseEvent &event) {
  ProjectScopedContainers newProjectScopedContainers = projectScopedContainers;
  newProjectScopedContainers.variablesContainersList =
      VariablesContainersList::MakeNewVariablesContainersListPushing(
          projectScopedContainers.GetVariablesContainersList(),
          event.GetVariables());
  return newProjectScopedContainers;
}

} // namespace gd