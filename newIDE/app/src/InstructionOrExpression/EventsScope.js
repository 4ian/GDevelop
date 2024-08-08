// @flow

// The way `gd` is usually used cannot be used because `ProjectScopedContainersAccessor`
// is used in `makeTestProject` right after GDevelopJS initialization. Doing so makes
// the storybook crash.
// const gd: libGDevelop = global.gd;

// Instruction or expression can be private (see IsPrivate, SetPrivate).
// Their visibility will change according to the scope (i.e: if we're
// editing events in a behavior, private instructions of the behavior
// will be visible).
export type EventsScope = {|
  project: gdProject,
  layout?: ?gdLayout,
  externalEvents?: ?gdExternalEvents,
  eventsFunctionsExtension?: ?gdEventsFunctionsExtension,
  eventsBasedBehavior?: ?gdEventsBasedBehavior,
  eventsBasedObject?: ?gdEventsBasedObject,
  eventsFunction?: ?gdEventsFunction,
|};

export class ProjectScopedContainersAccessor {
  _scope: EventsScope;
  _parameterObjectsContainer: gdObjectsContainer | null;
  _eventPath: Array<gdBaseEvent>;

  constructor(
    scope: EventsScope,
    parameterObjectsContainer: gdObjectsContainer | null = null,
    eventPath: Array<gdBaseEvent> = []
  ) {
    this._scope = scope;
    this._parameterObjectsContainer = parameterObjectsContainer;
    this._eventPath = eventPath;
    // Trigger parameterObjectsContainer update.
    this.get();
  }

  getScope(): EventsScope {
    return this._scope;
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
      projectScopedContainers = global.gd.ProjectScopedContainers.makeNewProjectScopedContainersForProjectAndLayout(
        project,
        layout
      );
    } else if (eventsFunctionsExtension) {
      if (eventsFunction) {
        if (!this._parameterObjectsContainer) {
          throw new Error('Extension scope used without any ObjectsContainer');
        }
        if (eventsBasedBehavior) {
          projectScopedContainers = global.gd.ProjectScopedContainers.makeNewProjectScopedContainersForBehaviorEventsFunction(
            project,
            eventsFunctionsExtension,
            eventsBasedBehavior,
            eventsFunction,
            this._parameterObjectsContainer
          );
        } else if (eventsBasedObject) {
          projectScopedContainers = global.gd.ProjectScopedContainers.makeNewProjectScopedContainersForObjectEventsFunction(
            project,
            eventsFunctionsExtension,
            eventsBasedObject,
            eventsFunction,
            this._parameterObjectsContainer
          );
        } else {
          projectScopedContainers = global.gd.ProjectScopedContainers.makeNewProjectScopedContainersForFreeEventsFunction(
            project,
            eventsFunctionsExtension,
            eventsFunction,
            this._parameterObjectsContainer
          );
        }
      } else if (eventsBasedObject) {
        if (!this._parameterObjectsContainer) {
          throw new Error('Extension scope used without any ObjectsContainer');
        }
        projectScopedContainers = global.gd.ProjectScopedContainers.makeNewProjectScopedContainersForEventsBasedObject(
          project,
          eventsFunctionsExtension,
          eventsBasedObject,
          this._parameterObjectsContainer
        );
      } else {
        projectScopedContainers = global.gd.ProjectScopedContainers.makeNewProjectScopedContainersForEventsFunctionsExtension(
          project,
          eventsFunctionsExtension
        );
      }
    } else {
      projectScopedContainers = global.gd.ProjectScopedContainers.makeNewProjectScopedContainersForProject(
        project
      );
    }
    for (const event of this._eventPath) {
      projectScopedContainers = global.gd.ProjectScopedContainers.makeNewProjectScopedContainersWithLocalVariables(
        projectScopedContainers,
        event
      );
    }

    return projectScopedContainers;
  }

  makeNewProjectScopedContainersWithLocalVariables(event: gdBaseEvent) {
    return new ProjectScopedContainersAccessor(
      this._scope,
      this._parameterObjectsContainer,
      [...this._eventPath, event]
    );
  }
}
