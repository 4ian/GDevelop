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
    const gd::Project &project, const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::EventsFunction &eventsFunction,
    gd::ObjectsContainer &parameterObjectsContainer) {

  gd::EventsFunctionTools::FreeEventsFunctionToObjectsContainer(
      project, eventsFunctionsExtension, eventsFunction, parameterObjectsContainer);

  ProjectScopedContainers projectScopedContainers(
      ObjectsContainersList::MakeNewObjectsContainersListForContainer(
          parameterObjectsContainer),
      VariablesContainersList::
          MakeNewVariablesContainersListForEventsFunctionsExtension(eventsFunctionsExtension),
      PropertiesContainersList::MakeNewEmptyPropertiesContainersList());

  projectScopedContainers.AddParameters(
      eventsFunction.GetParametersForEvents(eventsFunctionsExtension));

  return projectScopedContainers;
};

ProjectScopedContainers
ProjectScopedContainers::MakeNewProjectScopedContainersForBehaviorEventsFunction(
    const gd::Project &project, const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::EventsBasedBehavior& eventsBasedBehavior,
    const gd::EventsFunction &eventsFunction,
    gd::ObjectsContainer &parameterObjectsContainer) {

  gd::EventsFunctionTools::BehaviorEventsFunctionToObjectsContainer(
      project,
      eventsBasedBehavior,
      eventsFunction,
      parameterObjectsContainer);

  ProjectScopedContainers projectScopedContainers(
      ObjectsContainersList::MakeNewObjectsContainersListForContainer(
          parameterObjectsContainer),
      VariablesContainersList::
          MakeNewVariablesContainersListForEventsFunctionsExtension(eventsFunctionsExtension),
      PropertiesContainersList::MakeNewEmptyPropertiesContainersList());

  projectScopedContainers.AddPropertiesContainer(
      eventsBasedBehavior.GetSharedPropertyDescriptors());
  projectScopedContainers.AddPropertiesContainer(
      eventsBasedBehavior.GetPropertyDescriptors());
  projectScopedContainers.AddParameters(eventsFunction.GetParametersForEvents(
      eventsBasedBehavior.GetEventsFunctions()));

  return projectScopedContainers;
}

ProjectScopedContainers
ProjectScopedContainers::MakeNewProjectScopedContainersForObjectEventsFunction(
    const gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::EventsBasedObject &eventsBasedObject,
    const gd::EventsFunction &eventsFunction,
    gd::ObjectsContainer &parameterObjectsContainer) {

  gd::EventsFunctionTools::ObjectEventsFunctionToObjectsContainer(
      project, eventsBasedObject, eventsFunction, parameterObjectsContainer);

  ProjectScopedContainers projectScopedContainers(
      ObjectsContainersList::MakeNewObjectsContainersListForContainer(
          parameterObjectsContainer),
      VariablesContainersList::
          MakeNewVariablesContainersListForEventsFunctionsExtension(
              eventsFunctionsExtension),
      PropertiesContainersList::MakeNewEmptyPropertiesContainersList());

  projectScopedContainers.AddPropertiesContainer(
      eventsBasedObject.GetPropertyDescriptors());
  projectScopedContainers.AddParameters(eventsFunction.GetParametersForEvents(
      eventsBasedObject.GetEventsFunctions()));

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