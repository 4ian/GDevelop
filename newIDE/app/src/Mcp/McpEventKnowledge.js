// @flow
import { enumerateAllExpressions } from '../InstructionOrExpression/EnumerateExpressions';
import { enumerateAllInstructions } from '../InstructionOrExpression/EnumerateInstructions';
import {
  renderInstructionSentenceAsPlainText,
  renderNonTranslatedEventsAsText,
} from '../EventsSheet/EventsTree/TextRenderer';
import { serializeToJSON, unserializeFromJSObject } from '../Utils/Serializer';
import { mapFor } from '../Utils/MapFor';
import { scanEventsListForValidationErrors } from '../Utils/EventsValidationScanner';
import optionalRequire from '../Utils/OptionalRequire';

const gd: libGDevelop = global.gd;
const fs = optionalRequire('fs');
const path = optionalRequire('path');

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const normalizeLimit = (limit: any): number => {
  if (typeof limit !== 'number' || !Number.isFinite(limit))
    return DEFAULT_LIMIT;
  return Math.max(1, Math.min(MAX_LIMIT, Math.floor(limit)));
};

const normalizeText = (text: string): string => text.toLowerCase();

const includesQuery = (values: Array<?string>, query: string): boolean => {
  const normalizedQuery = normalizeText(query);
  return values.some(value =>
    value ? normalizeText(value).includes(normalizedQuery) : false
  );
};

const summarizeParameter = (
  parameterMetadata: gdParameterMetadata,
  index: number
): Object => {
  const valueTypeMetadata = parameterMetadata.getValueTypeMetadata();
  const parameter = {
    index,
    type: parameterMetadata.getType(),
    name: parameterMetadata.getName() || undefined,
    description: parameterMetadata.getDescription() || undefined,
    longDescription: parameterMetadata.getLongDescription() || undefined,
    hint: parameterMetadata.getHint() || undefined,
    extraInfo: parameterMetadata.getExtraInfo() || undefined,
    defaultValue: parameterMetadata.getDefaultValue() || undefined,
    isOptional: parameterMetadata.isOptional(),
    isCodeOnly: parameterMetadata.isCodeOnly(),
    valueType: valueTypeMetadata
      ? {
          name: valueTypeMetadata.getName(),
          extraInfo: valueTypeMetadata.getExtraInfo() || undefined,
          isOptional: valueTypeMetadata.isOptional(),
          defaultValue: valueTypeMetadata.getDefaultValue() || undefined,
          isObject: valueTypeMetadata.isObject(),
          isBehavior: valueTypeMetadata.isBehavior(),
          isNumber: valueTypeMetadata.isNumber(),
          isString: valueTypeMetadata.isString(),
          isVariable: valueTypeMetadata.isVariable(),
          isResource: valueTypeMetadata.isResource(),
        }
      : undefined,
  };
  return parameter;
};

const summarizeInstructionMetadata = ({
  type,
  kind,
  metadata,
  fullGroupName,
}: {|
  type: string,
  kind: 'action' | 'condition',
  metadata: gdInstructionMetadata,
  fullGroupName?: ?string,
|}): Object => ({
  kind,
  type,
  fullName: metadata.getFullName(),
  description: metadata.getDescription(),
  sentence: metadata.getSentence(),
  group: fullGroupName || metadata.getGroup(),
  helpPath: metadata.getHelpPath(),
  iconFilename: metadata.getIconFilename(),
  smallIconFilename: metadata.getSmallIconFilename(),
  canHaveSubInstructions: metadata.canHaveSubInstructions(),
  isHidden: metadata.isHidden(),
  isPrivate: metadata.isPrivate(),
  isAsync: metadata.isAsync(),
  isOptionallyAsync: metadata.isOptionallyAsync(),
  isRelevantForSceneEvents: metadata.isRelevantForLayoutEvents(),
  isRelevantForFunctionEvents: metadata.isRelevantForFunctionEvents(),
  isRelevantForAsynchronousFunctionEvents: metadata.isRelevantForAsynchronousFunctionEvents(),
  isRelevantForCustomObjectEvents: metadata.isRelevantForCustomObjectEvents(),
  usageComplexity: metadata.getUsageComplexity(),
  deprecationMessage: metadata.getDeprecationMessage() || undefined,
  parameters: mapFor(0, metadata.getParametersCount(), index =>
    summarizeParameter(metadata.getParameter(index), index)
  ),
});

const summarizeExpressionMetadata = ({
  type,
  metadata,
  fullGroupName,
}: {|
  type: string,
  metadata: gdExpressionMetadata,
  fullGroupName?: ?string,
|}): Object => ({
  kind: 'expression',
  type,
  fullName: metadata.getFullName(),
  description: metadata.getDescription(),
  group: fullGroupName || metadata.getGroup(),
  returnType: metadata.getReturnType(),
  helpPath: metadata.getHelpPath(),
  smallIconFilename: metadata.getSmallIconFilename(),
  isShown: metadata.isShown(),
  isPrivate: metadata.isPrivate(),
  isDeprecated: metadata.isDeprecated(),
  isRelevantForSceneEvents: metadata.isRelevantForLayoutEvents(),
  isRelevantForFunctionEvents: metadata.isRelevantForFunctionEvents(),
  isRelevantForAsynchronousFunctionEvents: metadata.isRelevantForAsynchronousFunctionEvents(),
  isRelevantForCustomObjectEvents: metadata.isRelevantForCustomObjectEvents(),
  deprecationMessage: metadata.getDeprecationMessage() || undefined,
  parameters: mapFor(0, metadata.getParametersCount(), index =>
    summarizeParameter(metadata.getParameter(index), index)
  ),
});

export const getEventOperationReference = (): Object => ({
  targetPathFormat:
    'Use event-0 for the first root event, event-0.1 for the second sub-event of the first root event, or an aiGeneratedEventId previously assigned by GDevelop.',
  generatedEventsFormat:
    'generated_events must be a JSON string containing an array of serialized GDevelop events. The same array string can also be passed as events_json when using add_scene_events.',
  operations: [
    {
      name: 'insert_at_end',
      requiresTarget: false,
      requiresGeneratedEvents: true,
      description:
        'Append generated events at the end of the scene event sheet.',
    },
    {
      name: 'insert_before_event',
      requiresTarget: true,
      requiresGeneratedEvents: true,
      description:
        'Insert generated events immediately before the target event.',
    },
    {
      name: 'insert_after_event',
      requiresTarget: true,
      requiresGeneratedEvents: true,
      description:
        'Insert generated events immediately after the target event.',
    },
    {
      name: 'insert_as_sub_event',
      requiresTarget: true,
      requiresGeneratedEvents: true,
      description: 'Insert generated events as sub-events of the target event.',
    },
    {
      name: 'insert_and_replace_event',
      requiresTarget: true,
      requiresGeneratedEvents: true,
      description:
        'Delete the target event and insert generated events at the same position.',
    },
    {
      name: 'replace_entire_event_and_sub_events',
      requiresTarget: true,
      requiresGeneratedEvents: true,
      description:
        'Alias of insert_and_replace_event. Replace the target event and its sub-events.',
    },
    {
      name: 'replace_event_but_keep_existing_sub_events',
      requiresTarget: true,
      requiresGeneratedEvents: true,
      description:
        'Replace the target event body while keeping its existing sub-events.',
    },
    {
      name: 'insert_actions_conditions_at_end',
      requiresTarget: true,
      requiresGeneratedEvents: true,
      description:
        'Append the generated standard event actions and conditions to the target standard event.',
    },
    {
      name: 'insert_actions_conditions_at_start',
      requiresTarget: true,
      requiresGeneratedEvents: true,
      description:
        'Prepend the generated standard event actions and conditions to the target standard event.',
    },
    {
      name: 'replace_all_actions',
      requiresTarget: true,
      requiresGeneratedEvents: true,
      description:
        'Replace all actions of the target standard event with actions from the generated standard event.',
    },
    {
      name: 'replace_all_conditions',
      requiresTarget: true,
      requiresGeneratedEvents: true,
      description:
        'Replace all conditions of the target standard event with conditions from the generated standard event.',
    },
    {
      name: 'delete_event',
      requiresTarget: true,
      requiresGeneratedEvents: false,
      description:
        'Delete the target event. Multiple comma-separated targets are supported for this operation only.',
    },
  ],
});

const standardEventWithInstructionExample = [
  {
    type: 'BuiltinCommonInstructions::Standard',
    conditions: [
      {
        type: { value: 'SceneJustBegins' },
        parameters: [''],
      },
    ],
    actions: [
      {
        type: { value: 'SetNumberVariable' },
        parameters: ['Score', '=', '0'],
      },
    ],
  },
];

const commentEventExample = [
  {
    type: 'BuiltinCommonInstructions::Comment',
    comment: 'Initialize the score when the scene starts.',
    color: {
      r: 255,
      g: 230,
      b: 109,
      textR: 0,
      textG: 0,
      textB: 0,
    },
  },
];

const groupEventExample = [
  {
    type: 'BuiltinCommonInstructions::Group',
    name: 'Initialization',
    folded: true,
    colorR: 74,
    colorG: 176,
    colorB: 228,
    events: standardEventWithInstructionExample,
  },
];

export const getEventsJsonExamples = ({
  project,
  sceneName,
  includeExistingSceneEvents,
}: {|
  project: gdProject,
  sceneName?: ?string,
  includeExistingSceneEvents?: ?boolean,
|}): Object => {
  const standardEventsJson = JSON.stringify(
    standardEventWithInstructionExample,
    null,
    2
  );
  const commentEventsJson = JSON.stringify(commentEventExample, null, 2);
  const groupEventsJson = JSON.stringify(groupEventExample, null, 2);
  const examples: Array<Object> = [
    {
      name: 'Append one standard event',
      purpose:
        'Use this shape for most game logic: a standard event with conditions and actions.',
      events_json: standardEventsJson,
      event_changes: [
        {
          operation_name: 'insert_at_end',
          generated_events: standardEventsJson,
        },
      ],
    },
    {
      name: 'Append a comment event',
      purpose: 'Use comments to explain or separate generated event blocks.',
      events_json: commentEventsJson,
      event_changes: [
        {
          operation_name: 'insert_at_end',
          generated_events: commentEventsJson,
        },
      ],
    },
    {
      name: 'Append a group event with one sub-event',
      purpose:
        'Use groups as visual/organizational wrappers. Put executable logic in the group events array.',
      events_json: groupEventsJson,
      event_changes: [
        {
          operation_name: 'insert_at_end',
          generated_events: groupEventsJson,
        },
      ],
    },
  ];

  if (
    includeExistingSceneEvents &&
    sceneName &&
    project.hasLayoutNamed(sceneName)
  ) {
    const currentEvents = project.getLayout(sceneName).getEvents();
    if (!currentEvents.isEmpty()) {
      const sceneEventsJson = serializeToJSON(currentEvents);
      examples.push({
        name: `Current events from scene "${sceneName}"`,
        purpose:
          'A real serialized event sheet from the currently opened project. Use as a project-specific reference only.',
        events_json: sceneEventsJson,
        event_changes: [
          {
            operation_name: 'insert_at_end',
            generated_events: sceneEventsJson,
          },
        ],
      });
    }
  }

  return {
    eventJsonShape:
      'Serialized scene events are a JSON array. A standard event uses type "BuiltinCommonInstructions::Standard", conditions: [{ type: { value: "<condition type>" }, parameters: [...] }], actions: [{ type: { value: "<action type>" }, parameters: [...] }], and optional nested events: [...].',
    addSceneEventsShape:
      'For add_scene_events, pass { scene_name, events_json } for append-at-end, or { scene_name, event_changes: [{ operation_name, operation_target_event, generated_events }] } for precise edits.',
    sources: [
      {
        name: 'GDevelop events documentation',
        url: 'https://wiki.gdevelop.io/gdevelop5/events/',
      },
      {
        name: 'GDevelop events editor documentation',
        url: 'https://wiki.gdevelop.io/gdevelop5/interface/events-editor/',
      },
      {
        name: 'GDevelop official examples repository',
        url: 'https://github.com/GDevelopApp/GDevelop-examples',
      },
    ],
    examples,
  };
};

const getInstructionMetadata = (
  project: gdProject,
  type: string,
  kind: string
): ?Object => {
  if (kind === 'condition') {
    const metadata = gd.MetadataProvider.getConditionMetadata(
      project.getCurrentPlatform(),
      type
    );
    return gd.MetadataProvider.isBadInstructionMetadata(metadata)
      ? null
      : summarizeInstructionMetadata({ type, kind: 'condition', metadata });
  }

  if (kind === 'action') {
    const metadata = gd.MetadataProvider.getActionMetadata(
      project.getCurrentPlatform(),
      type
    );
    return gd.MetadataProvider.isBadInstructionMetadata(metadata)
      ? null
      : summarizeInstructionMetadata({ type, kind: 'action', metadata });
  }

  if (kind === 'expression') {
    const numberExpressionMetadata = gd.MetadataProvider.getExpressionMetadata(
      project.getCurrentPlatform(),
      type
    );
    if (
      !gd.MetadataProvider.isBadExpressionMetadata(numberExpressionMetadata)
    ) {
      return summarizeExpressionMetadata({
        type,
        metadata: numberExpressionMetadata,
      });
    }

    const stringExpressionMetadata = gd.MetadataProvider.getStrExpressionMetadata(
      project.getCurrentPlatform(),
      type
    );
    if (
      !gd.MetadataProvider.isBadExpressionMetadata(stringExpressionMetadata)
    ) {
      return summarizeExpressionMetadata({
        type,
        metadata: stringExpressionMetadata,
      });
    }
  }

  return null;
};

export const getExactInstructionMetadata = ({
  project,
  type,
  kind,
}: {|
  project: gdProject,
  type?: ?string,
  kind?: ?string,
|}): Object => {
  if (!type) {
    return {
      error: 'Missing type.',
    };
  }
  if (!kind) {
    return {
      error: 'Missing kind. Use action, condition, or expression.',
    };
  }

  const metadata = getInstructionMetadata(project, type, kind);
  return (
    metadata || {
      error: `No ${kind} metadata found for "${type}". Use gdevelop_search_instruction_metadata first to find exact types.`,
    }
  );
};

export const searchInstructionMetadata = ({
  project,
  i18n,
  query,
  kind,
  limit,
}: {|
  project: gdProject,
  i18n: any,
  query?: ?string,
  kind?: ?string,
  limit?: ?number,
|}): Object => {
  const normalizedKind = kind || 'all';
  const resultLimit = normalizeLimit(limit);
  const results: Array<Object> = [];
  const searchQuery = query || '';

  if (!searchQuery) {
    return {
      query: searchQuery,
      kind: normalizedKind,
      limit: resultLimit,
      results: [],
      note:
        'Provide a query such as an internal type, displayed name, description, group, object name, or behavior name.',
    };
  }

  if (normalizedKind === 'all' || normalizedKind === 'action') {
    for (const instruction of enumerateAllInstructions(false, project, i18n)) {
      if (
        includesQuery(
          [
            instruction.type,
            instruction.displayedName,
            instruction.description,
            instruction.fullGroupName,
            instruction.scope.extension.name,
            instruction.scope.objectMetadata &&
              instruction.scope.objectMetadata.name,
            instruction.scope.behaviorMetadata &&
              instruction.scope.behaviorMetadata.name,
          ],
          searchQuery
        )
      ) {
        results.push(
          summarizeInstructionMetadata({
            type: instruction.type,
            kind: 'action',
            metadata: instruction.metadata,
            fullGroupName: instruction.fullGroupName,
          })
        );
      }
      if (results.length >= resultLimit) break;
    }
  }

  if (
    results.length < resultLimit &&
    (normalizedKind === 'all' || normalizedKind === 'condition')
  ) {
    for (const instruction of enumerateAllInstructions(true, project, i18n)) {
      if (
        includesQuery(
          [
            instruction.type,
            instruction.displayedName,
            instruction.description,
            instruction.fullGroupName,
            instruction.scope.extension.name,
            instruction.scope.objectMetadata &&
              instruction.scope.objectMetadata.name,
            instruction.scope.behaviorMetadata &&
              instruction.scope.behaviorMetadata.name,
          ],
          searchQuery
        )
      ) {
        results.push(
          summarizeInstructionMetadata({
            type: instruction.type,
            kind: 'condition',
            metadata: instruction.metadata,
            fullGroupName: instruction.fullGroupName,
          })
        );
      }
      if (results.length >= resultLimit) break;
    }
  }

  if (
    results.length < resultLimit &&
    (normalizedKind === 'all' || normalizedKind === 'expression')
  ) {
    for (const expression of enumerateAllExpressions('', project, i18n)) {
      if (
        includesQuery(
          [
            expression.type,
            expression.displayedName,
            expression.fullGroupName,
            expression.scope.extension.name,
            expression.scope.objectMetadata &&
              expression.scope.objectMetadata.name,
            expression.scope.behaviorMetadata &&
              expression.scope.behaviorMetadata.name,
          ],
          searchQuery
        )
      ) {
        results.push(
          summarizeExpressionMetadata({
            type: expression.type,
            metadata: expression.metadata,
            fullGroupName: expression.fullGroupName,
          })
        );
      }
      if (results.length >= resultLimit) break;
    }
  }

  return {
    query: searchQuery,
    kind: normalizedKind,
    limit: resultLimit,
    results,
  };
};

const getInstructionMetadataForValidation = (
  project: gdProject,
  instructionType: string,
  isCondition: boolean
): ?gdInstructionMetadata => {
  const metadata = isCondition
    ? gd.MetadataProvider.getConditionMetadata(
        project.getCurrentPlatform(),
        instructionType
      )
    : gd.MetadataProvider.getActionMetadata(
        project.getCurrentPlatform(),
        instructionType
      );
  return gd.MetadataProvider.isBadInstructionMetadata(metadata)
    ? null
    : metadata;
};

const isUrlResourceFile = (file: string): boolean =>
  file.startsWith('http://') ||
  file.startsWith('https://') ||
  file.startsWith('ftp://') ||
  file.startsWith('blob:') ||
  file.startsWith('data:');

const resolveLocalResourceFile = (
  project: gdProject,
  file: string
): string | null => {
  if (!file || !path || isUrlResourceFile(file)) return null;
  if (path.isAbsolute(file)) return file;

  const projectFile = project.getProjectFile();
  if (!projectFile) return null;
  return path.resolve(path.dirname(projectFile), file);
};

const getExpectedResourceKind = (parameterType: string): string | null => {
  if (
    parameterType === 'soundfile' ||
    parameterType === 'musicfile' ||
    parameterType === 'audioResource'
  ) {
    return 'audio';
  }
  if (parameterType === 'imageResource') return 'image';
  if (parameterType === 'fontResource') return 'font';
  if (parameterType === 'videoResource') return 'video';
  if (parameterType === 'jsonResource') return 'json';
  if (parameterType === 'bitmapFontResource') return 'bitmapFont';
  if (parameterType === 'tilemapResource') return 'tilemap';
  if (parameterType === 'tilesetResource') return 'tileset';
  if (parameterType === 'model3DResource') return 'model3D';
  if (parameterType === 'atlasResource') return 'atlas';
  if (parameterType === 'spineResource') return 'spine';
  return null;
};

const isResourceParameter = (
  parameterMetadata: gdParameterMetadata
): boolean => {
  const valueTypeMetadata = parameterMetadata.getValueTypeMetadata();
  return !!(
    valueTypeMetadata &&
    valueTypeMetadata.isResource &&
    valueTypeMetadata.isResource()
  );
};

const validateReferencedResource = ({
  project,
  instructionType,
  instructionSentence,
  isCondition,
  eventPath,
  instructionIndex,
  parameterIndex,
  parameterMetadata,
  resourceName,
  issues,
}: {|
  project: gdProject,
  instructionType: string,
  instructionSentence: string,
  isCondition: boolean,
  eventPath: Array<number>,
  instructionIndex: number,
  parameterIndex: number,
  parameterMetadata: gdParameterMetadata,
  resourceName: string,
  issues: Array<Object>,
|}) => {
  if (!resourceName) return;
  const resourcesManager = project.getResourcesManager();
  if (!resourcesManager.hasResource(resourceName)) {
    // GDevelop's InstructionValidator already reports the invalid parameter.
    return;
  }

  const resource = resourcesManager.getResource(resourceName);
  const expectedKind = getExpectedResourceKind(parameterMetadata.getType());
  if (expectedKind && resource.getKind() !== expectedKind) {
    issues.push({
      severity: 'error',
      type: 'resource-kind-mismatch',
      isCondition,
      instructionType,
      instructionSentence,
      eventPath,
      instructionIndex,
      parameterIndex,
      resourceName,
      resourceKind: resource.getKind(),
      expectedResourceKind: expectedKind,
    });
  }

  const resourceFile = resource.getFile();
  if (!resourceFile) {
    issues.push({
      severity: 'error',
      type: 'resource-empty-file',
      isCondition,
      instructionType,
      instructionSentence,
      eventPath,
      instructionIndex,
      parameterIndex,
      resourceName,
      resourceKind: resource.getKind(),
    });
    return;
  }

  const resolvedFile = resolveLocalResourceFile(project, resourceFile);
  if (resolvedFile && fs && !fs.existsSync(resolvedFile)) {
    issues.push({
      severity: 'error',
      type: 'resource-missing-file',
      isCondition,
      instructionType,
      instructionSentence,
      eventPath,
      instructionIndex,
      parameterIndex,
      resourceName,
      resourceKind: resource.getKind(),
      resourceFile,
      resolvedFile,
    });
  }
};

const validateInstructionsList = ({
  project,
  instructionsList,
  isCondition,
  path,
  issues,
}: {|
  project: gdProject,
  instructionsList: gdInstructionsList,
  isCondition: boolean,
  path: Array<number>,
  issues: Array<Object>,
|}) => {
  mapFor(0, instructionsList.size(), instructionIndex => {
    const instruction = instructionsList.get(instructionIndex);
    const instructionType = instruction.getType();
    if (!instructionType) {
      issues.push({
        severity: 'error',
        type: 'missing-instruction-type',
        isCondition,
        eventPath: path,
        instructionIndex,
      });
      return;
    }

    const metadata = getInstructionMetadataForValidation(
      project,
      instructionType,
      isCondition
    );
    if (!metadata) {
      issues.push({
        severity: 'error',
        type: 'unknown-instruction',
        isCondition,
        instructionType,
        eventPath: path,
        instructionIndex,
      });
      return;
    }

    mapFor(0, metadata.getParametersCount(), parameterIndex => {
      const parameterMetadata = metadata.getParameter(parameterIndex);
      if (parameterMetadata.isCodeOnly()) return;

      const value =
        parameterIndex < instruction.getParametersCount()
          ? instruction.getParameter(parameterIndex).getPlainString()
          : '';
      const hasDefaultValue = parameterMetadata.getDefaultValue() !== '';
      const canBeEmpty =
        parameterMetadata.isOptional() ||
        hasDefaultValue ||
        parameterMetadata.getType() === 'yesorno' ||
        parameterMetadata.getType() === 'layer';

      if (!value && !canBeEmpty) {
        issues.push({
          severity: 'error',
          type: 'missing-required-parameter',
          isCondition,
          instructionType,
          instructionSentence: renderInstructionSentenceAsPlainText(
            instruction,
            metadata
          ),
          eventPath: path,
          instructionIndex,
          parameter: summarizeParameter(parameterMetadata, parameterIndex),
        });
      }

      if (isResourceParameter(parameterMetadata)) {
        validateReferencedResource({
          project,
          instructionType,
          instructionSentence: renderInstructionSentenceAsPlainText(
            instruction,
            metadata
          ),
          isCondition,
          eventPath: path,
          instructionIndex,
          parameterIndex,
          parameterMetadata,
          resourceName: value,
          issues,
        });
      }
    });

    if (instruction.getParametersCount() > metadata.getParametersCount()) {
      issues.push({
        severity: 'warning',
        type: 'extra-parameters',
        isCondition,
        instructionType,
        eventPath: path,
        instructionIndex,
        expectedParametersCount: metadata.getParametersCount(),
        actualParametersCount: instruction.getParametersCount(),
      });
    }

    if (metadata.canHaveSubInstructions()) {
      validateInstructionsList({
        project,
        instructionsList: instruction.getSubInstructions(),
        isCondition,
        path,
        issues,
      });
    }
  });
};

const validateEventsList = ({
  project,
  eventsList,
  path,
  issues,
  allowJavaScriptEvents,
}: {|
  project: gdProject,
  eventsList: gdEventsList,
  path?: Array<number>,
  issues: Array<Object>,
  allowJavaScriptEvents?: boolean,
|}) => {
  const currentPath = path || [];
  mapFor(0, eventsList.getEventsCount(), eventIndex => {
    const eventPath = [...currentPath, eventIndex];
    const event = eventsList.getEventAt(eventIndex);
    const eventType = event.getType();

    if (!eventType) {
      issues.push({
        severity: 'error',
        type: 'missing-event-type',
        eventPath,
      });
      return;
    }

    if (
      eventType === 'BuiltinCommonInstructions::JsCode' &&
      !allowJavaScriptEvents
    ) {
      issues.push({
        severity: 'error',
        type: 'javascript-event-not-allowed',
        eventPath,
        eventType,
        suggestion:
          'Use standard GDevelop events, conditions, actions, expressions, behaviors, or extensions. Only pass allow_javascript_events: true when the user explicitly requested JavaScript.',
      });
    }

    if (eventType === 'BuiltinCommonInstructions::Standard') {
      const standardEvent = gd.asStandardEvent(event);
      validateInstructionsList({
        project,
        instructionsList: standardEvent.getConditions(),
        isCondition: true,
        path: eventPath,
        issues,
      });
      validateInstructionsList({
        project,
        instructionsList: standardEvent.getActions(),
        isCondition: false,
        path: eventPath,
        issues,
      });
    } else if (eventType === 'BuiltinCommonInstructions::While') {
      validateInstructionsList({
        project,
        instructionsList: gd.asWhileEvent(event).getWhileConditions(),
        isCondition: true,
        path: eventPath,
        issues,
      });
    }

    if (event.canHaveSubEvents()) {
      validateEventsList({
        project,
        eventsList: event.getSubEvents(),
        path: eventPath,
        issues,
        allowJavaScriptEvents,
      });
    }
  });
};

const withActionableSuggestion = (issue: Object): Object => {
  if (issue.suggestion) return issue;

  if (
    issue.type === 'invalid-parameter' &&
    typeof issue.parameterValue === 'string' &&
    issue.parameterValue &&
    !issue.parameterValue.trim().startsWith('"')
  ) {
    return {
      ...issue,
      suggestion: `If this parameter expects a text/string expression, wrap literal text in quotes. For this value, try ${JSON.stringify(
        issue.parameterValue
      )}.`,
    };
  }

  if (
    issue.type === 'invalid-parameter' &&
    typeof issue.parameterIndex === 'number'
  ) {
    return {
      ...issue,
      suggestion:
        'Check the exact parameter type/order with gdevelop_get_instruction_metadata, then rewrite this parameter as a valid GDevelop expression for that type.',
    };
  }

  return issue;
};

export const validateEventsJson = ({
  project,
  sceneName,
  eventsJson,
  allowJavaScriptEvents,
}: {|
  project: gdProject,
  sceneName?: ?string,
  eventsJson?: ?string,
  allowJavaScriptEvents?: boolean,
|}): Object => {
  if (!eventsJson) {
    return {
      valid: false,
      errors: ['Missing events_json.'],
    };
  }

  let parsedEvents;
  try {
    parsedEvents = JSON.parse(eventsJson);
  } catch (error) {
    return {
      valid: false,
      errors: [`Invalid JSON: ${error.message}`],
    };
  }

  if (!Array.isArray(parsedEvents)) {
    return {
      valid: false,
      errors: ['events_json must be a JSON array of serialized events.'],
    };
  }

  const eventsList = new gd.EventsList();
  try {
    unserializeFromJSObject(
      eventsList,
      parsedEvents,
      'unserializeFrom',
      project
    );
    const issues: Array<Object> = [];
    validateEventsList({
      project,
      eventsList,
      issues,
      allowJavaScriptEvents,
    });
    const layout =
      sceneName && project.hasLayoutNamed(sceneName)
        ? project.getLayout(sceneName)
        : null;
    const parameterValidationIssues = scanEventsListForValidationErrors({
      project,
      eventsList,
      layout,
    }).map(error => ({
      severity: 'error',
      ...error,
    }));
    issues.push(...parameterValidationIssues);
    const issuesWithSuggestions = issues.map(withActionableSuggestion);
    const errors = issuesWithSuggestions.filter(
      issue => issue.severity === 'error'
    );

    return {
      valid: errors.length === 0,
      eventsCount: eventsList.getEventsCount(),
      eventsAsText: renderNonTranslatedEventsAsText({ eventsList }),
      normalizedEventsJson: serializeToJSON(eventsList),
      errors,
      issues: issuesWithSuggestions,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [`Could not unserialize events_json: ${error.message}`],
    };
  } finally {
    eventsList.delete();
  }
};
