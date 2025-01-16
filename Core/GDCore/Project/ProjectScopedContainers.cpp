#include "ProjectScopedContainers.h"

#include "GDCore/IDE/EventsFunctionTools.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/EventsBasedObject.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Extensions/PlatformExtension.h"

namespace gd {

ProjectScopedContainers
ProjectScopedContainers::MakeNewProjectScopedContainersForProjectAndLayout(
    const gd::Project &project, const gd::Layout &layout) {
  ProjectScopedContainers projectScopedContainers(
      ObjectsContainersList::MakeNewObjectsContainersListForProjectAndLayout(
          project, layout),
      VariablesContainersList::
          MakeNewVariablesContainersListForProjectAndLayout(project, layout),
      &project.GetVariables(), &layout.GetVariables(),
      PropertiesContainersList::MakeNewEmptyPropertiesContainersList());

  return projectScopedContainers;
}

ProjectScopedContainers
ProjectScopedContainers::MakeNewProjectScopedContainersForProject(
    const gd::Project &project) {
  ProjectScopedContainers projectScopedContainers(
      ObjectsContainersList::MakeNewObjectsContainersListForProject(project),
      VariablesContainersList::MakeNewVariablesContainersListForProject(
          project),
      &project.GetVariables(), nullptr,
      PropertiesContainersList::MakeNewEmptyPropertiesContainersList());

  return projectScopedContainers;
}

ProjectScopedContainers
ProjectScopedContainers::MakeNewProjectScopedContainersFor(
    const gd::ObjectsContainer &globalObjectsContainers,
    const gd::ObjectsContainer &objectsContainers) {
  ProjectScopedContainers projectScopedContainers(
      ObjectsContainersList::MakeNewObjectsContainersListForContainers(
          globalObjectsContainers, objectsContainers),
      VariablesContainersList::MakeNewEmptyVariablesContainersList(),
      nullptr, nullptr,
      PropertiesContainersList::MakeNewEmptyPropertiesContainersList());

  return projectScopedContainers;
};

ProjectScopedContainers
ProjectScopedContainers::MakeNewProjectScopedContainersForEventsFunctionsExtension(
    const gd::Project &project, const gd::EventsFunctionsExtension &eventsFunctionsExtension) {

  ProjectScopedContainers projectScopedContainers(
      ObjectsContainersList::MakeNewEmptyObjectsContainersList(),
      VariablesContainersList::
          MakeNewVariablesContainersListForEventsFunctionsExtension(eventsFunctionsExtension),
      &eventsFunctionsExtension.GetGlobalVariables(),
      &eventsFunctionsExtension.GetSceneVariables(),
      PropertiesContainersList::MakeNewEmptyPropertiesContainersList());

  return projectScopedContainers;
};

ProjectScopedContainers
ProjectScopedContainers::MakeNewProjectScopedContainersForFreeEventsFunction(
    const gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::EventsFunction &eventsFunction,
    gd::ObjectsContainer &parameterObjectsContainer,
    gd::VariablesContainer &parameterVariablesContainer) {

  gd::EventsFunctionTools::FreeEventsFunctionToObjectsContainer(
      project, eventsFunctionsExtension, eventsFunction,
      parameterObjectsContainer);

  ProjectScopedContainers projectScopedContainers(
      ObjectsContainersList::MakeNewObjectsContainersListForContainer(
          parameterObjectsContainer),
      VariablesContainersList::
          MakeNewVariablesContainersListForFreeEventsFunction(
              eventsFunctionsExtension, eventsFunction,
              parameterVariablesContainer),
      &eventsFunctionsExtension.GetGlobalVariables(),
      &eventsFunctionsExtension.GetSceneVariables(),
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
    gd::ObjectsContainer &parameterObjectsContainer,
    gd::VariablesContainer &parameterVariablesContainer,
    gd::VariablesContainer &propertyVariablesContainer) {

  gd::EventsFunctionTools::BehaviorEventsFunctionToObjectsContainer(
      project,
      eventsBasedBehavior,
      eventsFunction,
      parameterObjectsContainer);

  ProjectScopedContainers projectScopedContainers(
      ObjectsContainersList::MakeNewObjectsContainersListForContainer(
          parameterObjectsContainer),
      VariablesContainersList::
          MakeNewVariablesContainersListForBehaviorEventsFunction(
              eventsFunctionsExtension, eventsBasedBehavior, eventsFunction,
              parameterVariablesContainer, propertyVariablesContainer),
      &eventsFunctionsExtension.GetGlobalVariables(),
      &eventsFunctionsExtension.GetSceneVariables(),
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
    gd::ObjectsContainer &parameterObjectsContainer,
    gd::VariablesContainer &parameterVariablesContainer,
    gd::VariablesContainer &propertyVariablesContainer) {

  gd::EventsFunctionTools::ObjectEventsFunctionToObjectsContainer(
      project, eventsBasedObject, eventsFunction, parameterObjectsContainer);

  ProjectScopedContainers projectScopedContainers(
      ObjectsContainersList::MakeNewObjectsContainersListForContainers(
          eventsBasedObject.GetObjects(),
          parameterObjectsContainer),
      VariablesContainersList::
          MakeNewVariablesContainersListForObjectEventsFunction(
              eventsFunctionsExtension, eventsBasedObject, eventsFunction,
              parameterVariablesContainer, propertyVariablesContainer),
      &eventsFunctionsExtension.GetGlobalVariables(),
      &eventsFunctionsExtension.GetSceneVariables(),
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
  outputObjectsContainer.Clear();
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

  ProjectScopedContainers projectScopedContainers(
      ObjectsContainersList::MakeNewObjectsContainersListForContainers(
          eventsBasedObject.GetObjects(), outputObjectsContainer),
      VariablesContainersList::
          MakeNewVariablesContainersListForEventsFunctionsExtension(
              eventsFunctionsExtension),
      &eventsFunctionsExtension.GetGlobalVariables(),
      &eventsFunctionsExtension.GetSceneVariables(),
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