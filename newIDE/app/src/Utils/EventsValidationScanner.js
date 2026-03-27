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
 * Derive the location name and extension scope from a ProjectScopedContainers.
 * For extension functions, the scope info is stored on the containers by the
 * C++ factory methods.
 */
const getExtensionScopeFromContainers = (
  projectScopedContainers: gdProjectScopedContainers
): {|
  locationName: string,
  extensionScope: {|
    extensionName: string,
    functionName: string,
    behaviorName: ?string,
    objectName: ?string,
  |},
|} => {
  const extensionName = projectScopedContainers.getScopeExtensionName();
  const functionName = projectScopedContainers.getScopeFunctionName();
  const behaviorName = projectScopedContainers.getScopeBehaviorName() || null;
  const objectName = projectScopedContainers.getScopeObjectName() || null;

  const locationName = behaviorName
    ? `${extensionName} / ${behaviorName} / ${functionName}`
    : objectName
    ? `${extensionName} / ${objectName} / ${functionName}`
    : `${extensionName} / ${functionName}`;

  return {
    locationName,
    extensionScope: {
      extensionName,
      functionName,
      behaviorName,
      objectName,
    },
  };
};

/**
 * Create a validation worker that uses C++ event traversal.
 * This leverages ReadOnlyArbitraryEventsWorkerWithContext which properly
 * handles local variable scoping as it traverses the event tree.
 *
 * The worker can be used across multiple Launch calls (e.g. from
 * ProjectBrowserHelper). For extension scanning, it derives the extension
 * scope from the ProjectScopedContainers.
 */
const createValidationWorker = (
  platform: gdPlatform,
  errors: Array<ValidationError>,
  options: {|
    /** Fixed location info for layout/external-events scanning. */
    locationName?: string,
    locationType: 'scene' | 'external-events' | 'extension',
    /** If provided, this is used for the event ptr to path map. */
    eventPtrToPathMap?: Map<number, EventPath>,
  |}
): gdReadOnlyArbitraryEventsWorkerWithContextJS => {
  const worker = new gd.ReadOnlyArbitraryEventsWorkerWithContextJS();
  worker.setSkipDisabledEvents(true);

  let currentEventPath: EventPath = [];
  // For multi-function traversal (extensions), the path map is rebuilt
  // at each Launch via doStartLaunch.
  let eventPtrToPathMap: Map<number, EventPath> =
    options.eventPtrToPathMap || new Map();

  // $FlowFixMe[incompatible-type] - overriding C++ method:
  // $FlowFixMe[cannot-write]
  worker.doStartLaunch = (events: gdEventsList) => {
    // Rebuild the event path map for the new events list being launched.
    // This is called at the start of each Launch (e.g. for each function
    // in an extension).
    if (!options.eventPtrToPathMap) {
      eventPtrToPathMap = buildEventPtrToPathMap(events);
    }
  };

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

    // Derive location info: for extensions, read from projectScopedContainers;
    // for scenes/external events, use the fixed values.
    let locationName: string;
    let locationType = options.locationType;
    let extensionScope: ?{|
      extensionName: string,
      functionName: string,
      behaviorName: ?string,
      objectName: ?string,
    |} = undefined;

    if (locationType === 'extension') {
      const scopeInfo = getExtensionScopeFromContainers(
        projectScopedContainers
      );
      locationName = scopeInfo.locationName;
      extensionScope = scopeInfo.extensionScope;
    } else {
      locationName = options.locationName || '';
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
    const worker = createValidationWorker(platform, errors, {
      locationName,
      locationType: 'scene',
      eventPtrToPathMap,
    });
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
    const worker = createValidationWorker(platform, errors, {
      locationName,
      locationType: 'external-events',
      eventPtrToPathMap,
    });
    worker.launch(externalEvents.getEvents(), projectScopedContainers);
    worker.delete();
  });

  // Scan all extension functions (free, behavior, object) using C++ traversal.
  // This uses ProjectBrowserHelper::ExposeEventsFunctionsExtensionEvents which
  // handles creating proper ProjectScopedContainers for each function type.
  mapFor(0, project.getEventsFunctionsExtensionsCount(), extensionIndex => {
    const extension = project.getEventsFunctionsExtensionAt(extensionIndex);

    // Skip store extensions - users cannot edit them.
    if (extension.getOriginName() === 'gdevelop-extension-store') {
      return;
    }

    // Create a single worker for the entire extension. The worker uses
    // doStartLaunch to rebuild the event path map for each function,
    // and derives the extension scope from projectScopedContainers.
    const worker = createValidationWorker(platform, errors, {
      locationType: 'extension',
    });

    gd.ProjectBrowserHelper.exposeEventsFunctionsExtensionEvents(
      project,
      extension,
      worker
    );

    worker.delete();
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
      // Group by location
      const key = `${error.locationType}: ${error.locationName}`;
      if (!invalidParameters.has(key)) {
        invalidParameters.set(key, []);
      }
      const invalidList = invalidParameters.get(key);
      if (invalidList) invalidList.push(error);
    }
  }

  return { missingInstructions, invalidParameters };
};
