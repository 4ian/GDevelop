// @flow
const gd: libGDevelop = global.gd;

// Instruction or expression can be private (see IsPrivate, SetPrivate).
// Their visibility will change according to the scope (i.e: if we're
// editing events in a behavior, private instructions of the behavior
// will be visible).
export type EventsScope = {|
  project: gdProject,
  layout?: ?gdLayout,
  externalEvents?: ?gdExternalEvents,
  eventsFunctionsExtension?: gdEventsFunctionsExtension,
  eventsBasedBehavior?: ?gdEventsBasedBehavior,
  eventsBasedObject?: ?gdEventsBasedObject,
  eventsFunction?: gdEventsFunction,
|};

export const getProjectScopedContainersFromScope = (
  scope: EventsScope,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer
): gdProjectScopedContainers => {
  if (scope.layout) {
    return gd.ProjectScopedContainers.makeNewProjectScopedContainersForProjectAndLayout(
      scope.project,
      scope.layout
    );
  }

  const projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersFor(
    globalObjectsContainer,
    objectsContainer
  );

  if (scope.eventsBasedBehavior) {
    projectScopedContainers.addPropertiesContainer(
      scope.eventsBasedBehavior.getSharedPropertyDescriptors()
    );
    projectScopedContainers.addPropertiesContainer(
      scope.eventsBasedBehavior.getPropertyDescriptors()
    );
  }

  if (scope.eventsBasedObject) {
    projectScopedContainers.addPropertiesContainer(
      scope.eventsBasedObject.getPropertyDescriptors()
    );
  }

  return projectScopedContainers;
};
