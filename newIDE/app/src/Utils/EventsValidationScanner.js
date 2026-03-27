// @flow
// Scanner for validation errors in events (missing instructions, invalid parameters)
import { mapFor } from './MapFor';
import { getFunctionNameFromType } from '../EventsFunctionsExtensionsLoader';
import type { EventPath } from './EventPath';
import { renderInstructionSentenceAsPlainText } from '../EventsSheet/EventsTree/TextRenderer';

const gd: libGDevelop = global.gd;

export type ValidationErrorType =
  | 'missing-instruction'
  | 'invalid-parameter'
  | 'missing-parameter';

export type ValidationError = {|
  type: ValidationErrorType,
  isCondition: boolean,
  instructionType: string,
  instructionSentence: string,
  parameterIndex?: number,
  parameterValue?: string,
  locationName: string,
  locationType: 'scene' | 'external-events' | 'extension',
  eventPath: EventPath,
  extensionName?: string,
  functionName?: string,
  behaviorName?: ?string,
  objectName?: ?string,
|};

/**
 * Build a map from event pointer to its path in the events list.
 * This allows us to track event paths when using the C++ worker.
 */
const buildEventPtrToPathMap = (
  eventsList: gdEventsList,
  parentPath: EventPath = []
): Map<number, EventPath> => {
  const map = new Map<number, EventPath>();
  mapFor(0, eventsList.getEventsCount(), index => {
    const event = eventsList.getEventAt(index);
    const currentPath = [...parentPath, index];
    // $FlowFixMe[incompatible-type] - ptr is a number identifying the C++ object
    map.set(event.ptr, currentPath);

    if (event.canHaveSubEvents()) {
      const subEventsMap = buildEventPtrToPathMap(
        event.getSubEvents(),
        currentPath
      );
      subEventsMap.forEach((path, ptr) => map.set(ptr, path));
    }
  });
  return map;
};

/**
 * Create a validation worker that uses C++ event traversal.
 * This leverages ReadOnlyArbitraryEventsWorkerWithContext which properly
 * handles local variable scoping as it traverses the event tree.
 */
const createValidationWorker = (
  platform: gdPlatform,
  locationName: string,
  locationType: 'scene' | 'external-events' | 'extension',
  eventPtrToPathMap: Map<number, EventPath>,
  errors: Array<ValidationError>,
  extensionScope?: {|
    extensionName: string,
    functionName: string,
    behaviorName?: ?string,
    objectName?: ?string,
  |}
): gdReadOnlyArbitraryEventsWorkerWithContextJS => {
  const worker = new gd.ReadOnlyArbitraryEventsWorkerWithContextJS();
  worker.setSkipDisabledEvents(true);

  let currentEventPath: EventPath = [];

  // $FlowFixMe[incompatible-type] - overriding C++ method:
  // $FlowFixMe[cannot-write]
  worker.doVisitEvent = (event: gdBaseEvent) => {
    const path = eventPtrToPathMap.get(event.ptr);
    if (path) {
      currentEventPath = path;
    }
  };

  // $FlowFixMe[incompatible-type] - overriding C++ method:
  // $FlowFixMe[cannot-write]
  worker.doVisitInstruction = (
    instruction: gdInstruction,
    isCondition: boolean,
    projectScopedContainers: gdProjectScopedContainers
  ) => {
    const type = instruction.getType();

    // Skip empty instruction types
    if (!type || type.trim() === '') {
      return;
    }

    // Get metadata
    const metadata = isCondition
      ? gd.MetadataProvider.getConditionMetadata(gd.JsPlatform.get(), type)
      : gd.MetadataProvider.getActionMetadata(gd.JsPlatform.get(), type);

    const isBad = gd.MetadataProvider.isBadInstructionMetadata(metadata);

    // Check if instruction is missing (from uninstalled extension)
    if (isBad) {
      errors.push({
        type: 'missing-instruction',
        isCondition,
        instructionType: type,
        instructionSentence: type,
        locationName,
        locationType,
        eventPath: [...currentEventPath],
        ...(extensionScope || {}),
      });
      return;
    }

    const instructionSentence = renderInstructionSentenceAsPlainText(
      instruction,
      metadata
    );

    // Validate parameters
    const parametersCount = metadata.getParametersCount();
    mapFor(0, parametersCount, parameterIndex => {
      const parameterMetadata = metadata.getParameter(parameterIndex);
      const parameterType = parameterMetadata.getType();
      const value = instruction.getParameter(parameterIndex).getPlainString();

      // Skip validation for layer parameter with empty value (default layer)
      if (parameterType === 'layer' && value === '') {
        return;
      }

      // Skip codeOnly parameters
      if (parameterMetadata.isCodeOnly()) {
        return;
      }

      // Skip optional parameters with empty values (they will use defaults)
      if (value === '' && parameterMetadata.isOptional()) {
        return;
      }

      // Skip parameters with empty values that have default values
      if (value === '' && parameterMetadata.getDefaultValue() !== '') {
        return;
      }

      // Skip yesorno parameters with empty values (they default to "no")
      if (parameterType === 'yesorno' && value === '') {
        return;
      }

      // Check if parameter is valid using the projectScopedContainers
      // passed from C++, which includes local variables in scope
      const isValid = gd.InstructionValidator.isParameterValid(
        platform,
        projectScopedContainers,
        instruction,
        metadata,
        parameterIndex,
        value
      );

      if (!isValid) {
        errors.push({
          type: value === '' ? 'missing-parameter' : 'invalid-parameter',
          isCondition,
          instructionType: type,
          instructionSentence,
          parameterIndex,
          parameterValue: value,
          locationName,
          locationType,
          eventPath: [...currentEventPath],
          ...(extensionScope || {}),
        });
      }
    });
  };

  return worker;
};

/**
 * Scans the entire project for validation errors in events.
 * This includes missing instructions (from uninstalled extensions)
 * and invalid parameters.
 */
export const scanProjectForValidationErrors = (
  project: gdProject
): Array<ValidationError> => {
  const errors: Array<ValidationError> = [];
  const platform = gd.JsPlatform.get();

  // Scan all layouts (scenes)
  mapFor(0, project.getLayoutsCount(), index => {
    const layout = project.getLayoutAt(index);
    const locationName = layout.getName();

    const projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersForProjectAndLayout(
      project,
      layout
    );

    const eventPtrToPathMap = buildEventPtrToPathMap(layout.getEvents());
    const worker = createValidationWorker(
      platform,
      locationName,
      'scene',
      eventPtrToPathMap,
      errors
    );
    worker.launch(layout.getEvents(), projectScopedContainers);
    worker.delete();
  });

  // Scan all external events
  mapFor(0, project.getExternalEventsCount(), index => {
    const externalEvents = project.getExternalEventsAt(index);
    const locationName = externalEvents.getName();

    // External events are associated with a layout
    const associatedLayoutName = externalEvents.getAssociatedLayout();
    let projectScopedContainers;
    if (associatedLayoutName && project.hasLayoutNamed(associatedLayoutName)) {
      const layout = project.getLayout(associatedLayoutName);
      projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersForProjectAndLayout(
        project,
        layout
      );
    } else {
      projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersForProject(
        project
      );
    }

    const eventPtrToPathMap = buildEventPtrToPathMap(
      externalEvents.getEvents()
    );
    const worker = createValidationWorker(
      platform,
      locationName,
      'external-events',
      eventPtrToPathMap,
      errors
    );
    worker.launch(externalEvents.getEvents(), projectScopedContainers);
    worker.delete();
  });

  // Scan all extension functions (free, behavior, object)
  mapFor(0, project.getEventsFunctionsExtensionsCount(), extensionIndex => {
    const extension = project.getEventsFunctionsExtensionAt(extensionIndex);

    // Skip store extensions - users cannot edit them.
    if (extension.getOriginName() === 'gdevelop-extension-store') {
      return;
    }

    const extensionName = extension.getName();

    // Helper: scan a single events function with proper scoped containers.
    const scanEventsFunction = ({
      eventsFunction,
      eventsBasedBehavior,
      eventsBasedObject,
    }: {|
      eventsFunction: gdEventsFunction,
      eventsBasedBehavior: ?gdEventsBasedBehavior,
      eventsBasedObject: ?gdEventsBasedObject,
    |}) => {
      const functionName = eventsFunction.getName();
      const objContainer = new gd.ObjectsContainer(
        gd.ObjectsContainer.Function
      );
      const paramVarContainer = new gd.VariablesContainer(
        gd.VariablesContainer.Parameters
      );
      const paramResContainer = new gd.ResourcesContainer(
        gd.ResourcesContainer.Parameters
      );

      let projectScopedContainers;
      let propVarContainer: ?gdVariablesContainer;
      let propResContainer: ?gdResourcesContainer;

      try {
        if (eventsBasedBehavior) {
          propVarContainer = new gd.VariablesContainer(
            gd.VariablesContainer.Properties
          );
          propResContainer = new gd.ResourcesContainer(
            gd.ResourcesContainer.Properties
          );
          projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersForBehaviorEventsFunction(
            project,
            extension,
            eventsBasedBehavior,
            eventsFunction,
            objContainer,
            paramVarContainer,
            propVarContainer,
            paramResContainer,
            propResContainer
          );
        } else if (eventsBasedObject) {
          propVarContainer = new gd.VariablesContainer(
            gd.VariablesContainer.Properties
          );
          propResContainer = new gd.ResourcesContainer(
            gd.ResourcesContainer.Properties
          );
          projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersForObjectEventsFunction(
            project,
            extension,
            eventsBasedObject,
            eventsFunction,
            objContainer,
            paramVarContainer,
            propVarContainer,
            paramResContainer,
            propResContainer
          );
        } else {
          projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersForFreeEventsFunction(
            project,
            extension,
            eventsFunction,
            objContainer,
            paramVarContainer,
            paramResContainer
          );
        }

        const behaviorName = eventsBasedBehavior
          ? eventsBasedBehavior.getName()
          : null;
        const objectName = eventsBasedObject
          ? eventsBasedObject.getName()
          : null;
        const locationName = behaviorName
          ? `${extensionName} / ${behaviorName} / ${functionName}`
          : objectName
          ? `${extensionName} / ${objectName} / ${functionName}`
          : `${extensionName} / ${functionName}`;

        const eventPtrToPathMap = buildEventPtrToPathMap(
          eventsFunction.getEvents()
        );
        const worker = createValidationWorker(
          platform,
          locationName,
          'extension',
          eventPtrToPathMap,
          errors,
          {
            extensionName,
            functionName,
            behaviorName,
            objectName,
          }
        );
        worker.launch(eventsFunction.getEvents(), projectScopedContainers);
        worker.delete();
      } finally {
        objContainer.delete();
        paramVarContainer.delete();
        paramResContainer.delete();
        if (propVarContainer) propVarContainer.delete();
        if (propResContainer) propResContainer.delete();
      }
    };

    // Free functions
    const freeFunctions = extension.getEventsFunctions();
    mapFor(0, freeFunctions.getEventsFunctionsCount(), functionIndex => {
      scanEventsFunction({
        eventsFunction: freeFunctions.getEventsFunctionAt(functionIndex),
        eventsBasedBehavior: null,
        eventsBasedObject: null,
      });
    });

    // Behavior functions
    const eventsBasedBehaviors = extension.getEventsBasedBehaviors();
    mapFor(0, eventsBasedBehaviors.getCount(), behaviorIndex => {
      const behavior = eventsBasedBehaviors.getAt(behaviorIndex);
      const behaviorFunctions = behavior.getEventsFunctions();
      mapFor(0, behaviorFunctions.getEventsFunctionsCount(), functionIndex => {
        scanEventsFunction({
          eventsFunction: behaviorFunctions.getEventsFunctionAt(functionIndex),
          eventsBasedBehavior: behavior,
          eventsBasedObject: null,
        });
      });
    });

    // Object functions
    const eventsBasedObjects = extension.getEventsBasedObjects();
    mapFor(0, eventsBasedObjects.getCount(), objectIndex => {
      const object = eventsBasedObjects.getAt(objectIndex);
      const objectFunctions = object.getEventsFunctions();
      mapFor(0, objectFunctions.getEventsFunctionsCount(), functionIndex => {
        scanEventsFunction({
          eventsFunction: objectFunctions.getEventsFunctionAt(functionIndex),
          eventsBasedBehavior: null,
          eventsBasedObject: object,
        });
      });
    });
  });

  return errors;
};

export type GroupedValidationErrors = {|
  missingInstructions: Map<string, Array<ValidationError>>,
  invalidParameters: Map<string, Array<ValidationError>>,
|};

/**
 * Finds an event by its path in the events list.
 * Returns null if the event cannot be found.
 */
export const findEventByPath = (
  eventsList: gdEventsList,
  path: EventPath
): ?gdBaseEvent => {
  if (path.length === 0) return null;

  let currentEventsList = eventsList;
  let event: ?gdBaseEvent = null;

  for (let i = 0; i < path.length; i++) {
    const index = path[i];
    if (index < 0 || index >= currentEventsList.getEventsCount()) {
      return null;
    }

    event = currentEventsList.getEventAt(index);

    // If not at the last index, go to sub-events
    if (i < path.length - 1) {
      if (!event.canHaveSubEvents()) {
        return null;
      }
      currentEventsList = event.getSubEvents();
    }
  }

  return event;
};

/**
 * Groups validation errors by type for display in the UI.
 */
export const groupValidationErrors = (
  errors: Array<ValidationError>
): GroupedValidationErrors => {
  const missingInstructions = new Map<string, Array<ValidationError>>();
  const invalidParameters = new Map<string, Array<ValidationError>>();

  for (const error of errors) {
    if (error.type === 'missing-instruction') {
      // Group by extension name
      const { extensionName } = getFunctionNameFromType(error.instructionType);
      const key = extensionName || 'Unknown';
      if (!missingInstructions.has(key)) {
        missingInstructions.set(key, []);
      }
      const missingList = missingInstructions.get(key);
      if (missingList) missingList.push(error);
    } else {
      // Group by location (extension errors include function path)
      const key =
        error.locationType === 'extension'
          ? `extension: ${error.locationName}`
          : `${error.locationType}: ${error.locationName}`;
      if (!invalidParameters.has(key)) {
        invalidParameters.set(key, []);
      }
      const invalidList = invalidParameters.get(key);
      if (invalidList) invalidList.push(error);
    }
  }

  return { missingInstructions, invalidParameters };
};
