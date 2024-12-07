// @flow

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
  _parameterVariablesContainer: gdVariablesContainer | null;
  _propertyVariablesContainer: gdVariablesContainer | null;
  _eventPath: Array<gdBaseEvent>;

  constructor(
    scope: EventsScope,
    parameterObjectsContainer: gdObjectsContainer | null = null,
    parameterVariablesContainer: gdVariablesContainer | null = null,
    propertyVariablesContainer: gdVariablesContainer | null = null,
    eventPath: Array<gdBaseEvent> = []
  ) {
    this._scope = scope;
    this._parameterObjectsContainer = parameterObjectsContainer;
    this._parameterVariablesContainer = parameterVariablesContainer;
    this._propertyVariablesContainer = propertyVariablesContainer;
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
    const gd: libGDevelop = global.gd;

    if (layout) {
      projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersForProjectAndLayout(
        project,
        layout
      );
    } else if (eventsFunctionsExtension) {
      if (eventsFunction) {
        if (!this._parameterObjectsContainer) {
          throw new Error('Extension scope used without any ObjectsContainer');
        }
        if (!this._parameterVariablesContainer) {
          throw new Error(
            'Extension scope used without a VariablesContainer for parameters'
          );
        }
        if (eventsBasedBehavior) {
          if (!this._propertyVariablesContainer) {
            throw new Error(
              'Extension scope used without a VariablesContainer for properties'
            );
          }
          projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersForBehaviorEventsFunction(
            project,
            eventsFunctionsExtension,
            eventsBasedBehavior,
            eventsFunction,
            this._parameterObjectsContainer,
            this._parameterVariablesContainer,
            this._propertyVariablesContainer
          );
        } else if (eventsBasedObject) {
          if (!this._propertyVariablesContainer) {
            throw new Error(
              'Extension scope used without a VariablesContainer for properties'
            );
          }
          projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersForObjectEventsFunction(
            project,
            eventsFunctionsExtension,
            eventsBasedObject,
            eventsFunction,
            this._parameterObjectsContainer,
            this._parameterVariablesContainer,
            this._propertyVariablesContainer
          );
        } else {
          projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersForFreeEventsFunction(
            project,
            eventsFunctionsExtension,
            eventsFunction,
            this._parameterObjectsContainer,
            this._parameterVariablesContainer
          );
        }
      } else if (eventsBasedObject) {
        if (!this._parameterObjectsContainer) {
          throw new Error('Extension scope used without any ObjectsContainer');
        }
        projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersForEventsBasedObject(
          project,
          eventsFunctionsExtension,
          eventsBasedObject,
          this._parameterObjectsContainer
        );
      } else {
        projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersForEventsFunctionsExtension(
          project,
          eventsFunctionsExtension
        );
      }
    } else {
      projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersForProject(
        project
      );
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
    return new ProjectScopedContainersAccessor(
      this._scope,
      this._parameterObjectsContainer,
      this._parameterVariablesContainer,
      this._propertyVariablesContainer,
      [...this._eventPath, event]
    );
  }

  forEachObject(func: (object: gdObject) => void): void {
    const objectsContainersList = this.get().getObjectsContainersList();
    for (
      let containerIndex = 0;
      containerIndex < objectsContainersList.getObjectsContainersCount();
      containerIndex++
    ) {
      const objectsContainer = objectsContainersList.getObjectsContainer(
        containerIndex
      );

      for (
        let objectIndex = 0;
        objectIndex < objectsContainer.getObjectsCount();
        objectIndex++
      ) {
        const object = objectsContainer.getObjectAt(objectIndex);

        func(object);
      }
    }
  }
}
