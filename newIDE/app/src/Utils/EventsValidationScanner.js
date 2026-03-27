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
 *
 * The worker derives location info (scene name, external layout name, or
 * extension scope) entirely from the ProjectScopedContainers passed by C++,
 * so no options are needed.
 */
const createValidationWorker = (
  platform: gdPlatform,
  errors: Array<ValidationError>
): gdReadOnlyArbitraryEventsWorkerWithContextJS => {
  const worker = new gd.ReadOnlyArbitraryEventsWorkerWithContextJS();
  worker.setSkipDisabledEvents(true);

  let currentEventPath: EventPath = [];
  let eventPtrToPathMap: Map<number, EventPath> = new Map();

  // $FlowFixMe[incompatible-type] - overriding C++ method:
  // $FlowFixMe[cannot-write]
  worker.doOnLaunch = (events: gdEventsList) => {
    // Rebuild the event path map for each new events list (each scene,
    // external layout, or extension function).
    eventPtrToPathMap = buildEventPtrToPathMap(events);
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

    // Derive location info from ProjectScopedContainers scope.
    const extensionName = projectScopedContainers.getScopeExtensionName();
    const externalEventsName = projectScopedContainers.getScopeExternalEventsName();
    const sceneName = projectScopedContainers.getScopeSceneName();

    let locationName: string;
    let locationType: 'scene' | 'external-events' | 'extension';
    let extensionScope: ?{|
      extensionName: string,
      functionName: string,
      behaviorName: ?string,
      objectName: ?string,
    |} = undefined;

    if (extensionName) {
      locationType = 'extension';
      const functionName = projectScopedContainers.getScopeFunctionName();
      const behaviorName =
        projectScopedContainers.getScopeBehaviorName() || null;
      const objectName =
        projectScopedContainers.getScopeObjectName() || null;

      locationName = behaviorName
        ? `${extensionName} / ${behaviorName} / ${functionName}`
        : objectName
        ? `${extensionName} / ${objectName} / ${functionName}`
        : `${extensionName} / ${functionName}`;

      extensionScope = {
        extensionName,
        functionName,
        behaviorName,
        objectName,
      };
    } else if (externalEventsName) {
      locationType = 'external-events';
      locationName = externalEventsName;
    } else {
      locationType = 'scene';
      locationName = sceneName;
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

  // Create a single worker for the entire scan. The worker derives
  // location info from ProjectScopedContainers set by the C++ traversal.
  const worker = createValidationWorker(platform, errors);

  // Scan all layouts (scenes) and external events via C++ traversal.
  gd.ProjectBrowserHelper.exposeProjectEventsWithoutExtensions(
    project,
    worker
  );

  // Scan all extension functions (free, behavior, object).
  mapFor(0, project.getEventsFunctionsExtensionsCount(), extensionIndex => {
    const extension = project.getEventsFunctionsExtensionAt(extensionIndex);

    // Skip store extensions - users cannot edit them.
    if (extension.getOriginName() === 'gdevelop-extension-store') {
      return;
    }

    gd.ProjectBrowserHelper.exposeEventsFunctionsExtensionEvents(
      project,
      extension,
      worker
    );
  });

  worker.delete();

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
