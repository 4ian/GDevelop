// @flow
// Scanner for validation errors in events (missing instructions, invalid parameters)
import { mapFor } from './MapFor';
import { getFunctionNameFromType } from '../EventsFunctionsExtensionsLoader';

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
  eventPath: Array<number>,
|};

const getInstructionSentence = (
  instruction: gdInstruction,
  metadata: gdInstructionMetadata
): string => {
  const formatter = gd.InstructionSentenceFormatter.get();
  const formattedTexts = formatter.getAsFormattedText(instruction, metadata);
  let sentence = '';
  mapFor(0, formattedTexts.size(), i => {
    sentence += formattedTexts.getString(i);
  });
  return sentence.trim() || instruction.getType();
};

/**
 * Build a map from event pointer to its path in the events list.
 * This allows us to track event paths when using the C++ worker.
 */
const buildEventPtrToPathMap = (
  eventsList: gdEventsList,
  parentPath: Array<number> = []
): Map<number, Array<number>> => {
  const map = new Map<number, Array<number>>();
  mapFor(0, eventsList.getEventsCount(), index => {
    const event = eventsList.getEventAt(index);
    const currentPath = [...parentPath, index];
    // $FlowFixMe - ptr is a number identifying the C++ object
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
  eventPtrToPathMap: Map<number, Array<number>>,
  errors: Array<ValidationError>
): gdReadOnlyArbitraryEventsWorkerWithContextJS => {
  const worker = new gd.ReadOnlyArbitraryEventsWorkerWithContextJS();

  let currentEventPath: Array<number> = [];

  worker.doVisitEvent = (eventPtr: number) => {
    const path = eventPtrToPathMap.get(eventPtr);
    if (path) {
      currentEventPath = path;
    }
  };

  worker.doVisitInstruction = (
    instructionPtr: number,
    isConditionInt: number,
    projectScopedContainersPtr: number
  ) => {
    const instruction = gd.wrapPointer(instructionPtr, gd.Instruction);
    const projectScopedContainers = gd.wrapPointer(
      projectScopedContainersPtr,
      gd.ProjectScopedContainers
    );
    // C++ passes boolean as 0/1 through EM_ASM
    const isCondition: boolean = !!isConditionInt;

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
      });
      return;
    }

    const instructionSentence = getInstructionSentence(instruction, metadata);

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
  path: Array<number>
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
