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
  eventPath: Array<number>, // Path from root to the event (array of indices)
|};

type ScanContext = {|
  projectScopedContainers: gdProjectScopedContainers,
  locationName: string,
  locationType: 'scene' | 'external-events' | 'extension',
  eventPath: Array<number>, // Current path from root
  errors: Array<ValidationError>,
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

const scanInstruction = (
  platform: gdPlatform,
  instruction: gdInstruction,
  isCondition: boolean,
  context: ScanContext
): void => {
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
    context.errors.push({
      type: 'missing-instruction',
      isCondition,
      instructionType: type,
      instructionSentence: type,
      locationName: context.locationName,
      locationType: context.locationType,
      eventPath: [...context.eventPath],
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

    // Check if parameter is valid
    const isValid = gd.InstructionValidator.isParameterValid(
      platform,
      context.projectScopedContainers,
      instruction,
      metadata,
      parameterIndex,
      value
    );

    if (!isValid) {
      context.errors.push({
        type: value === '' ? 'missing-parameter' : 'invalid-parameter',
        isCondition,
        instructionType: type,
        instructionSentence,
        parameterIndex,
        parameterValue: value,
        locationName: context.locationName,
        locationType: context.locationType,
        eventPath: [...context.eventPath],
      });
    }
  });
};

const scanInstructionsList = (
  platform: gdPlatform,
  instructionsList: gdInstructionsList,
  isCondition: boolean,
  context: ScanContext
): void => {
  mapFor(0, instructionsList.size(), index => {
    const instruction = instructionsList.get(index);
    scanInstruction(platform, instruction, isCondition, context);

    // Scan sub-instructions if any
    if (instruction.getSubInstructions().size() > 0) {
      scanInstructionsList(
        platform,
        instruction.getSubInstructions(),
        isCondition,
        context
      );
    }
  });
};

const scanEventsList = (
  platform: gdPlatform,
  eventsList: gdEventsList,
  context: ScanContext
): void => {
  mapFor(0, eventsList.getEventsCount(), index => {
    const event = eventsList.getEventAt(index);
    // Build the event path by appending current index to parent path
    const currentEventPath = [...context.eventPath, index];
    const eventContext = { ...context, eventPath: currentEventPath };

    // Skip disabled events
    if (event.isDisabled()) {
      return;
    }

    // Update projectScopedContainers for events with local variables
    if (event.canHaveVariables()) {
      eventContext.projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersWithLocalVariables(
        context.projectScopedContainers,
        event
      );
    }

    // Get event type and handle accordingly (mutually exclusive checks)
    const eventType = event.getType();

    if (eventType === 'BuiltinCommonInstructions::Standard') {
      const standardEvent = gd.asStandardEvent(event);
      if (standardEvent) {
        scanInstructionsList(
          platform,
          standardEvent.getConditions(),
          true,
          eventContext
        );
        scanInstructionsList(
          platform,
          standardEvent.getActions(),
          false,
          eventContext
        );
      }
    } else if (eventType === 'BuiltinCommonInstructions::Repeat') {
      const repeatEvent = gd.asRepeatEvent(event);
      if (repeatEvent) {
        scanInstructionsList(
          platform,
          repeatEvent.getConditions(),
          true,
          eventContext
        );
        scanInstructionsList(
          platform,
          repeatEvent.getActions(),
          false,
          eventContext
        );
      }
    } else if (eventType === 'BuiltinCommonInstructions::While') {
      const whileEvent = gd.asWhileEvent(event);
      if (whileEvent) {
        scanInstructionsList(
          platform,
          whileEvent.getConditions(),
          true,
          eventContext
        );
        scanInstructionsList(
          platform,
          whileEvent.getWhileConditions(),
          true,
          eventContext
        );
        scanInstructionsList(
          platform,
          whileEvent.getActions(),
          false,
          eventContext
        );
      }
    } else if (eventType === 'BuiltinCommonInstructions::ForEach') {
      const forEachEvent = gd.asForEachEvent(event);
      if (forEachEvent) {
        scanInstructionsList(
          platform,
          forEachEvent.getConditions(),
          true,
          eventContext
        );
        scanInstructionsList(
          platform,
          forEachEvent.getActions(),
          false,
          eventContext
        );
      }
    } else if (
      eventType === 'BuiltinCommonInstructions::ForEachChildVariable'
    ) {
      const forEachChildVariableEvent = gd.asForEachChildVariableEvent(event);
      if (forEachChildVariableEvent) {
        scanInstructionsList(
          platform,
          forEachChildVariableEvent.getConditions(),
          true,
          eventContext
        );
        scanInstructionsList(
          platform,
          forEachChildVariableEvent.getActions(),
          false,
          eventContext
        );
      }
    }
    // Skip other event types (comments, groups, links, etc.)

    // Scan sub-events recursively
    if (event.canHaveSubEvents()) {
      scanEventsList(platform, event.getSubEvents(), eventContext);
    }
  });
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

    const context: ScanContext = {
      projectScopedContainers,
      locationName,
      locationType: 'scene',
      eventPath: [], // Start with empty path
      errors,
    };

    scanEventsList(platform, layout.getEvents(), context);
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

    const context: ScanContext = {
      projectScopedContainers,
      locationName,
      locationType: 'external-events',
      eventPath: [], // Start with empty path
      errors,
    };

    scanEventsList(platform, externalEvents.getEvents(), context);
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
