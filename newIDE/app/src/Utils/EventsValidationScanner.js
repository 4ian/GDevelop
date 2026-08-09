// @flow
// Scanner for validation errors in events (missing instructions, invalid parameters)
import { mapFor } from './MapFor';
import { getFunctionNameFromType } from '../EventsFunctionsExtensionsLoader';
import type { EventPath } from './EventPath';
import { renderInstructionSentenceAsPlainText } from '../EventsSheet/EventsTree/TextRenderer';
import { getKeyboardKeyDefinition } from './KeyboardKeyNames';

const gd: libGDevelop = global.gd;

export type ValidationErrorType =
  | 'missing-instruction'
  | 'invalid-parameter'
  | 'missing-parameter'
  | 'unsafe-external-layout-creation'
  | 'unconditioned-action'
  | 'lifecycle-incompatible'
  | 'lifecycle-redundant';

export type ValidationError = {|
  type: ValidationErrorType,
  diagnosticCode?: string,
  diagnosticMessage?: string,
  isCondition: boolean,
  instructionType: string,
  instructionSentence: string,
  parameterIndex?: number,
  parameterValue?: string,
  parameterType?: string,
  undeclaredVariable?: boolean,
  relatedBehaviorParameterIndex?: number,
  relatedBehaviorParameterValue?: string,
  locationName: string,
  locationType: 'scene' | 'external-events' | 'extension',
  eventPath: EventPath,
  extensionName?: string,
  functionName?: string,
  lifecycleFunctionName?: string,
  behaviorName?: ?string,
  objectName?: ?string,
|};

const getValidationErrorLocationInformationFromProjectScopedContainers = (
  projectScopedContainers: gdProjectScopedContainers
): {
  locationName: string,
  locationType: 'scene' | 'external-events' | 'extension',
  extensionName?: string,
  functionName?: string,
  lifecycleFunctionName?: string,
  behaviorName?: ?string,
  objectName?: ?string,
} => {
  const extensionName = projectScopedContainers.getScopeExtensionName();
  const externalEventsName = projectScopedContainers.getScopeExternalEventsName();
  const sceneName = projectScopedContainers.getScopeSceneName();
  // Keep validation usable while opening a project with an older libGD build.
  // New builds expose this method and preserve the lifecycle identity.
  const projectScopedContainersWithLifecycle: any = projectScopedContainers;
  const lifecycleFunctionName =
    typeof projectScopedContainersWithLifecycle.getScopeSceneLifecycleFunctionName ===
    'function'
      ? projectScopedContainersWithLifecycle.getScopeSceneLifecycleFunctionName()
      : '';

  if (extensionName) {
    const functionName = projectScopedContainers.getScopeFunctionName();
    const behaviorName = projectScopedContainers.getScopeBehaviorName() || null;
    const objectName = projectScopedContainers.getScopeObjectName() || null;

    const locationName = behaviorName
      ? `${extensionName} / ${behaviorName} / ${functionName}`
      : objectName
      ? `${extensionName} / ${objectName} / ${functionName}`
      : `${extensionName} / ${functionName}`;

    return {
      locationType: 'extension',
      locationName,
      extensionName,
      functionName,
      behaviorName,
      objectName,
    };
  } else if (externalEventsName) {
    return {
      locationType: 'external-events',
      locationName: externalEventsName,
      ...(lifecycleFunctionName ? { lifecycleFunctionName } : {}),
    };
  } else {
    return {
      locationType: 'scene',
      locationName: sceneName,
      ...(lifecycleFunctionName ? { lifecycleFunctionName } : {}),
    };
  }
};

/**
 * Build a map from event pointer to its path in the events list.
 * This allows us to track event paths when using the C++ worker.
 */
const hasEnabledInstructions = (instructionsList: gdInstructionsList) => {
  for (let index = 0; index < instructionsList.size(); index++) {
    if (!instructionsList.get(index).isDisabled()) return true;
  }
  return false;
};

const getFirstEnabledInstructionPtr = (
  instructionsList: gdInstructionsList
): ?number => {
  for (let index = 0; index < instructionsList.size(); index++) {
    const instruction = instructionsList.get(index);
    if (!instruction.isDisabled()) {
      // $FlowFixMe[prop-missing] - ptr is a number identifying the C++ object.
      return instruction.ptr;
    }
  }

  return null;
};

const getEventConditions = (event: gdBaseEvent): ?gdInstructionsList => {
  const eventType = event.getType();
  if (eventType === 'BuiltinCommonInstructions::Standard') {
    return gd.asStandardEvent(event).getConditions();
  }
  if (eventType === 'BuiltinCommonInstructions::ForEach') {
    return gd.asForEachEvent(event).getConditions();
  }
  return null;
};

type EventValidationContext = {|
  eventPath: EventPath,
  standardEventHasEnabledConditions: ?boolean,
  standardEventFirstEnabledActionPtr: ?number,
|};

const perFrameBehaviorLifecycleFunctionNames = new Set([
  'doStepPreEvents',
  'doStepPostEvents',
]);

const perFrameObjectLifecycleFunctionNames = new Set([
  'doStepPreEvents',
  'doStepPostEvents',
]);

const isPerFrameLifecycleFunctionInProjectExtension = (
  project: gdProject,
  projectScopedContainers: gdProjectScopedContainers
): boolean => {
  const extensionName = projectScopedContainers.getScopeExtensionName();
  if (
    !extensionName ||
    !project.hasEventsFunctionsExtensionNamed(extensionName)
  ) {
    return false;
  }

  const extension = project.getEventsFunctionsExtension(extensionName);
  if (extension.getOriginName()) {
    return false;
  }

  const functionName = projectScopedContainers.getScopeFunctionName();
  if (!functionName) {
    return false;
  }

  if (projectScopedContainers.getScopeBehaviorName()) {
    return perFrameBehaviorLifecycleFunctionNames.has(functionName);
  }
  if (projectScopedContainers.getScopeObjectName()) {
    return perFrameObjectLifecycleFunctionNames.has(functionName);
  }
  return false;
};

const isSceneUpdateLifecycleScope = (
  projectScopedContainers: gdProjectScopedContainers
): boolean => {
  const lifecycleFunctionName = projectScopedContainers.getScopeSceneLifecycleFunctionName();
  // An empty role is kept as sceneUpdate for compatibility with callers and
  // older libGD builds that don't propagate scene lifecycle identity.
  return !lifecycleFunctionName || lifecycleFunctionName === 'sceneUpdate';
};

const shouldValidateUnconditionedActionForScope = (
  project: gdProject,
  projectScopedContainers: gdProjectScopedContainers
): boolean => {
  if (!projectScopedContainers.getScopeExtensionName()) {
    return isSceneUpdateLifecycleScope(projectScopedContainers);
  }

  return isPerFrameLifecycleFunctionInProjectExtension(
    project,
    projectScopedContainers
  );
};

const getSceneLifecycleFunctionLabel = (name: string): string => {
  switch (name) {
    case 'sceneLoad':
      return 'On scene load';
    case 'sceneSignal':
      return 'On scene signal';
    case 'sceneUnload':
      return 'On scene unload';
    case 'sceneUpdate':
    default:
      return 'Scene update';
  }
};

const buildEventPtrToValidationContextMap = (
  eventsList: gdEventsList,
  parentPath: EventPath = [],
  parentHasEnabledConditions: boolean = false
): Map<number, EventValidationContext> => {
  const map = new Map<number, EventValidationContext>();
  mapFor(0, eventsList.getEventsCount(), index => {
    const event = eventsList.getEventAt(index);
    const currentPath = [...parentPath, index];
    const eventConditions = getEventConditions(event);
    const eventOwnHasEnabledConditions = eventConditions
      ? hasEnabledInstructions(eventConditions)
      : false;
    const standardEventHasEnabledConditions =
      event.getType() === 'BuiltinCommonInstructions::Standard'
        ? parentHasEnabledConditions || eventOwnHasEnabledConditions
        : null;
    const standardEventFirstEnabledActionPtr =
      event.getType() === 'BuiltinCommonInstructions::Standard'
        ? getFirstEnabledInstructionPtr(gd.asStandardEvent(event).getActions())
        : null;
    // $FlowFixMe[incompatible-type] - ptr is a number identifying the C++ object
    map.set(event.ptr, {
      eventPath: currentPath,
      standardEventHasEnabledConditions,
      standardEventFirstEnabledActionPtr,
    });

    if (event.canHaveSubEvents()) {
      const subEventsMap = buildEventPtrToValidationContextMap(
        event.getSubEvents(),
        currentPath,
        parentHasEnabledConditions || eventOwnHasEnabledConditions
      );
      subEventsMap.forEach((context, ptr) => map.set(ptr, context));
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
  project: gdProject,
  platform: gdPlatform,
  errors: Array<ValidationError>
): gdReadOnlyArbitraryEventsWorkerWithContextJS => {
  const worker = new gd.ReadOnlyArbitraryEventsWorkerWithContextJS();
  worker.setSkipDisabledEvents(true);

  let currentEventPath: EventPath = [];
  let currentStandardEventHasEnabledConditions: ?boolean = null;
  let currentStandardEventFirstEnabledActionPtr: ?number = null;
  let eventPtrToValidationContextMap: Map<
    number,
    EventValidationContext
  > = new Map();

  // $FlowFixMe[incompatible-type] - overriding C++ method:
  // $FlowFixMe[cannot-write]
  worker.doOnLaunch = (events: gdEventsList) => {
    // Rebuild the event path map for each new events list (each scene,
    // external layout, or extension function).
    eventPtrToValidationContextMap = buildEventPtrToValidationContextMap(
      events
    );
  };

  // $FlowFixMe[incompatible-type] - overriding C++ method:
  // $FlowFixMe[cannot-write]
  worker.doVisitEvent = (event: gdBaseEvent) => {
    const validationContext = eventPtrToValidationContextMap.get(event.ptr);
    if (validationContext) {
      currentEventPath = validationContext.eventPath;
      currentStandardEventHasEnabledConditions =
        validationContext.standardEventHasEnabledConditions;
      currentStandardEventFirstEnabledActionPtr =
        validationContext.standardEventFirstEnabledActionPtr;
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
        eventPath: [...currentEventPath],
        ...getValidationErrorLocationInformationFromProjectScopedContainers(
          projectScopedContainers
        ),
      });
      return;
    }

    const lifecycleFunctionName = projectScopedContainers.getScopeSceneLifecycleFunctionName();
    if (lifecycleFunctionName) {
      const instructionSentence = renderInstructionSentenceAsPlainText(
        instruction,
        metadata
      );
      const locationInformation = getValidationErrorLocationInformationFromProjectScopedContainers(
        projectScopedContainers
      );
      const addLifecycleDiagnostic = (
        diagnosticCode: string,
        diagnosticMessage: string,
        validationType: ValidationErrorType = 'lifecycle-incompatible'
      ) => {
        errors.push({
          type: validationType,
          diagnosticCode,
          diagnosticMessage,
          isCondition,
          instructionType: type,
          instructionSentence,
          eventPath: [...currentEventPath],
          ...locationInformation,
        });
      };

      if (
        type === 'SignalReceived' &&
        lifecycleFunctionName !== 'sceneUpdate'
      ) {
        addLifecycleDiagnostic(
          'SCENE_LIFECYCLE_FUNCTION_INVALID_SIGNAL_RECEIVED',
          `“Scene signal received” is only available in “Scene update” and cannot be used inside “${getSceneLifecycleFunctionLabel(
            lifecycleFunctionName
          )}”.${
            lifecycleFunctionName === 'sceneSignal'
              ? ' In “On scene signal”, compare SignalName() instead.'
              : ''
          }`
        );
      }

      if (
        type === 'SceneJustBegins' &&
        (lifecycleFunctionName === 'sceneLoad' ||
          lifecycleFunctionName === 'sceneUnload')
      ) {
        addLifecycleDiagnostic(
          'SCENE_LIFECYCLE_FUNCTION_REDUNDANT_SCENE_JUST_BEGINS',
          lifecycleFunctionName === 'sceneLoad'
            ? '“At the beginning of the scene” is redundant inside “On scene load”, which already runs once when the scene loads.'
            : '“At the beginning of the scene” is unnecessary inside “On scene unload”, which runs once immediately before the scene is destroyed.',
          'lifecycle-redundant'
        );
      }

      if (!isCondition && lifecycleFunctionName === 'sceneUnload') {
        if (metadata.isAsync() || metadata.requiresSceneFutureFrame()) {
          addLifecycleDiagnostic(
            'SCENE_LIFECYCLE_FUNCTION_ASYNC_NOT_SUPPORTED',
            '“On scene unload” is synchronous. This action needs a later scene frame, but the scene is destroyed immediately after the function finishes.'
          );
        } else if (metadata.emitsDeferredSceneSignal()) {
          addLifecycleDiagnostic(
            'SCENE_LIFECYCLE_FUNCTION_DEFERRED_SIGNAL_NOT_SUPPORTED',
            'Signals emitted from “On scene unload” cannot be delivered because the scene signal bus is about to be cleared.'
          );
        } else if (metadata.mutatesSceneStack()) {
          addLifecycleDiagnostic(
            'SCENE_LIFECYCLE_FUNCTION_TRANSITION_NOT_SUPPORTED',
            'The scene is already unloading. Scene transition actions cannot be requested from “On scene unload”.'
          );
        }
      }
    }

    if (
      !isCondition &&
      currentStandardEventHasEnabledConditions === false &&
      shouldValidateUnconditionedActionForScope(
        project,
        projectScopedContainers
      ) &&
      // $FlowFixMe[prop-missing] - ptr is a number identifying the C++ object.
      instruction.ptr === currentStandardEventFirstEnabledActionPtr
    ) {
      errors.push({
        type: 'unconditioned-action',
        isCondition,
        instructionType: type,
        instructionSentence: renderInstructionSentenceAsPlainText(
          instruction,
          metadata
        ),
        eventPath: [...currentEventPath],
        ...getValidationErrorLocationInformationFromProjectScopedContainers(
          projectScopedContainers
        ),
      });
    }

    if (
      !isCondition &&
      currentStandardEventHasEnabledConditions === false &&
      type === 'BuiltinExternalLayouts::CreateObjectsFromExternalLayout' &&
      !projectScopedContainers.getScopeExtensionName() &&
      isSceneUpdateLifecycleScope(projectScopedContainers)
    ) {
      errors.push({
        type: 'unsafe-external-layout-creation',
        isCondition,
        instructionType: type,
        instructionSentence: renderInstructionSentenceAsPlainText(
          instruction,
          metadata
        ),
        parameterValue:
          instruction.getParametersCount() > 1
            ? instruction.getParameter(1).getPlainString()
            : '',
        eventPath: [...currentEventPath],
        ...getValidationErrorLocationInformationFromProjectScopedContainers(
          projectScopedContainers
        ),
      });
    }

    // Validate parameters
    const parametersCount = metadata.getParametersCount();
    mapFor(0, parametersCount, parameterIndex => {
      const parameterMetadata = metadata.getParameter(parameterIndex);
      const parameterType = parameterMetadata.getType();
      const value = instruction.getParameter(parameterIndex).getPlainString();

      // Skip codeOnly parameters
      if (parameterMetadata.isCodeOnly()) {
        return;
      }

      // Empty layer parameters (base layer) and empty optional parameters are
      // considered valid directly by `InstructionValidator`.

      // Skip parameters with empty values that have default values
      if (value === '' && parameterMetadata.getDefaultValue() !== '') {
        return;
      }

      // Skip yesorno parameters with empty values (they default to "no")
      if (parameterType === 'yesorno' && value === '') {
        return;
      }

      if (parameterType === 'keyboardKey') {
        let literalKeyName = null;
        try {
          const parsedValue = JSON.parse(value);
          if (typeof parsedValue === 'string') literalKeyName = parsedValue;
        } catch (error) {
          // Dynamic string expressions cannot be proven invalid statically.
        }
        if (
          literalKeyName !== null &&
          !getKeyboardKeyDefinition(literalKeyName)
        ) {
          errors.push({
            type: 'invalid-parameter',
            diagnosticCode: 'INPUT_UNKNOWN_KEY_NAME',
            isCondition,
            instructionType: type,
            instructionSentence: renderInstructionSentenceAsPlainText(
              instruction,
              metadata
            ),
            parameterIndex,
            parameterValue: value,
            parameterType,
            eventPath: [...currentEventPath],
            ...getValidationErrorLocationInformationFromProjectScopedContainers(
              projectScopedContainers
            ),
          });
          return;
        }
      }

      // Check if parameter is valid using the projectScopedContainers
      // passed from C++, which includes local variables in scope
      const isValid = gd.InstructionValidator.isParameterValid(
        platform,
        projectScopedContainers,
        instruction,
        metadata,
        parameterIndex
      );

      if (!isValid) {
        const instructionSentence = renderInstructionSentenceAsPlainText(
          instruction,
          metadata
        );

        // An object parameter is reported invalid when one of the object's
        // required behavior parameters holds the wrong value. The most common
        // mistake is filling a behavior parameter with a behavior TYPE (e.g.
        // "PlatformBehavior::PlatformerObjectBehavior") instead of the behavior
        // NAME on the object (e.g. "PlatformerObject"). Detect a downstream
        // behavior parameter whose value looks like a type so the suggestion can
        // point at the real culprit instead of the object name.
        let relatedBehaviorParameterIndex;
        let relatedBehaviorParameterValue;
        if (value !== '' && parameterType === 'object') {
          for (
            let behaviorIndex = parameterIndex + 1;
            behaviorIndex < parametersCount;
            behaviorIndex++
          ) {
            const behaviorParameterMetadata = metadata.getParameter(
              behaviorIndex
            );
            const behaviorParameterType = behaviorParameterMetadata.getType();
            if (behaviorParameterType === 'object') break;
            if (behaviorParameterType !== 'behavior') continue;
            const behaviorValue = instruction
              .getParameter(behaviorIndex)
              .getPlainString();
            if (behaviorValue && behaviorValue.includes('::')) {
              relatedBehaviorParameterIndex = behaviorIndex;
              relatedBehaviorParameterValue = behaviorValue;
              break;
            }
          }
        }

        // A scene/global/local variable parameter whose value is a plain
        // identifier that is not declared in scope is the common "forgot to
        // declare the variable" case. Detect it so the suggestion can say so
        // instead of implying a quoting/syntax problem.
        let undeclaredVariable = false;
        if (
          value &&
          (parameterType === 'scenevar' ||
            parameterType === 'globalvar' ||
            parameterType === 'variable' ||
            parameterType === 'variableOrProperty') &&
          /^[A-Za-z_][A-Za-z0-9_]*$/.test(value)
        ) {
          try {
            const variablesContainersList = projectScopedContainers.getVariablesContainersList();
            if (
              variablesContainersList &&
              !variablesContainersList.has(value)
            ) {
              undeclaredVariable = true;
            }
          } catch (error) {
            // If the container API is unavailable, leave the flag unset.
          }
        }

        errors.push({
          type: value === '' ? 'missing-parameter' : 'invalid-parameter',
          isCondition,
          instructionType: type,
          instructionSentence,
          parameterIndex,
          parameterValue: value,
          parameterType,
          undeclaredVariable,
          relatedBehaviorParameterIndex,
          relatedBehaviorParameterValue,
          eventPath: [...currentEventPath],
          ...getValidationErrorLocationInformationFromProjectScopedContainers(
            projectScopedContainers
          ),
        });
      }
    });
  };

  return worker;
};

export const scanEventsListForValidationErrors = ({
  project,
  eventsList,
  layout,
  lifecycleFunction,
  lifecycleFunctionName,
  externalEventsName,
}: {|
  project: gdProject,
  eventsList: gdEventsList,
  layout?: ?gdLayout,
  lifecycleFunction?: ?gdEventsFunction,
  lifecycleFunctionName?: ?string,
  externalEventsName?: ?string,
|}): Array<ValidationError> => {
  const errors: Array<ValidationError> = [];
  const platform = gd.JsPlatform.get();
  const projectScopedContainers = layout
    ? gd.ProjectScopedContainers.makeNewProjectScopedContainersForProjectAndLayout(
        project,
        layout
      )
    : gd.ProjectScopedContainers.makeNewProjectScopedContainersForProject(
        project
      );
  if (lifecycleFunction) {
    projectScopedContainers.addParameters(lifecycleFunction.getParameters());
  }
  if (lifecycleFunctionName) {
    projectScopedContainers.setScopeSceneLifecycleFunctionName(
      lifecycleFunctionName
    );
  }
  if (externalEventsName) {
    projectScopedContainers.setScopeExternalEventsName(externalEventsName);
  }
  const worker = createValidationWorker(project, platform, errors);

  try {
    worker.launch(eventsList, projectScopedContainers);
  } finally {
    worker.delete();
  }

  return errors;
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
  const worker = createValidationWorker(project, platform, errors);

  // Scan all layouts (scenes) and external events via C++ traversal.
  gd.ProjectBrowserHelper.exposeProjectEventsWithoutExtensions(project, worker);

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
