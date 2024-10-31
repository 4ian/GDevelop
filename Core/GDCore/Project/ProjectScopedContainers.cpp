#include "ProjectScopedContainers.h"

#include "GDCore/IDE/EventsFunctionTools.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/EventsBasedObject.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Extensions/PlatformExtension.h"

namespace gd {

ProjectScopedContainers
ProjectScopedContainers::MakeNewProjectScopedContainersForEventsFunctionsExtension(
    const gd::Project &project, const gd::EventsFunctionsExtension &eventsFunctionsExtension) {

  ProjectScopedContainers projectScopedContainers(
      ObjectsContainersList::MakeNewEmptyObjectsContainersList(),
      VariablesContainersList::
          MakeNewVariablesContainersListForEventsFunctionsExtension(eventsFunctionsExtension),
      PropertiesContainersList::MakeNewEmptyPropertiesContainersList());

  return projectScopedContainers;
};

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
ProjectScopedContainers::MakeNewProjectScopedContainersForEventsBasedObject(
    const gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::EventsBasedObject &eventsBasedObject,
    gd::ObjectsContainer &outputObjectsContainer) {

  // TODO: We should avoid to use a single `outputObjectsContainer` and instead
  // use multiple, stable objects container pointed by the `ProjectScopedContainers`
  // created below.
  // Search for "ProjectScopedContainers wrongly containing temporary objects containers or objects"
  // in the codebase.
  outputObjectsContainer.GetObjects().clear();
  outputObjectsContainer.GetObjectGroups().Clear();

  // This object named "Object" represents the parent and is used by events.
  // TODO: Use a dedicated `ObjectsContainer` with only this "Object" and check in
  // the codebase that this container is not assumed as a
  // "globalObjectsContainer".
  // Search for "ProjectScopedContainers wrongly containing temporary objects containers or objects"
  // in the codebase.
  outputObjectsContainer.InsertNewObject(
      project,
      gd::PlatformExtension::GetObjectFullType(
          eventsFunctionsExtension.GetName(), eventsBasedObject.GetName()),
      "Object", outputObjectsContainer.GetObjectsCount());

  // TODO: We should avoid to do a copy of the objects container here - as this results
  // in an objects container that contains temporary objects. This can create issues in the
  // UI (for example, a tree view that keeps references on objects).
  // Search for "ProjectScopedContainers wrongly containing temporary objects containers or objects"
  // in the codebase.
  gd::EventsFunctionTools::CopyEventsBasedObjectChildrenToObjectsContainer(
      eventsBasedObject, outputObjectsContainer);

  ProjectScopedContainers projectScopedContainers(
      ObjectsContainersList::MakeNewObjectsContainersListForContainer(
          outputObjectsContainer),
      VariablesContainersList::
          MakeNewVariablesContainersListForEventsFunctionsExtension(
              eventsFunctionsExtension),
      PropertiesContainersList::MakeNewEmptyPropertiesContainersList());

  projectScopedContainers.AddPropertiesContainer(
      eventsBasedObject.GetPropertyDescriptors());

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