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
  eventsFunction?: ?gdEventsFunction,
|};

export class ProjectScopedContainers {
  _scope: EventsScope;
  _globalObjectsContainer: gdObjectsContainer;
  _objectsContainer: gdObjectsContainer;
  _eventPath: Array<gdBaseEvent>;

  constructor(
    scope: EventsScope,
    globalObjectsContainer: gdObjectsContainer,
    objectsContainer: gdObjectsContainer,
    eventPath: Array<gdBaseEvent> = []
  ) {
    this._scope = scope;
    this._globalObjectsContainer = globalObjectsContainer;
    this._objectsContainer = objectsContainer;
    this._eventPath = eventPath;
  }

  get(): gdProjectScopedContainers {
    let projectScopedContainers;
    const {
      project,
      layout,
      eventsFunctionsExtension,
      eventsBasedBehavior,
      eventsBasedObject,
      eventsFunction,
    } = this._scope;
    if (layout) {
      projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersForProjectAndLayout(
        project,
        layout
      );
    } else {
      projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersFor(
        this._globalObjectsContainer,
        this._objectsContainer
      );

      if (eventsBasedBehavior) {
        projectScopedContainers.addPropertiesContainer(
          eventsBasedBehavior.getSharedPropertyDescriptors()
        );
        projectScopedContainers.addPropertiesContainer(
          eventsBasedBehavior.getPropertyDescriptors()
        );
      }

      if (eventsBasedObject) {
        projectScopedContainers.addPropertiesContainer(
          eventsBasedObject.getPropertyDescriptors()
        );
      }

      if (eventsFunction) {
        const eventsFunctionsContainer =
          (eventsBasedObject && eventsBasedObject.getEventsFunctions()) ||
          (eventsBasedBehavior && eventsBasedBehavior.getEventsFunctions()) ||
          eventsFunctionsExtension ||
          null;

        if (eventsFunctionsContainer) {
          projectScopedContainers.addParameters(
            eventsFunction.getParametersForEvents(eventsFunctionsContainer)
          );
        } else {
          throw new Error(
            'Called `ProjectScopedContainers.get` with an eventsFunction but without eventsBasedBehavior, eventsBasedObject or eventsFunctionsExtension'
          );
        }
      }
    }
    for (const event of this._eventPath) {
      projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersWithLocalVariables(
        projectScopedContainers,
        event
      );
    }

    return projectScopedContainers;
  }

  makeNewProjectScopedContainersWithLocalVariables(event: gdBaseEvent) {
    return new ProjectScopedContainers(
      this._scope,
      this._globalObjectsContainer,
      this._objectsContainer,
      [...this._eventPath, event]
    );
  }
}
