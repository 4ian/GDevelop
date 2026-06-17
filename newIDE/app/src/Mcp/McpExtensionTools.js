// @flow
import { renderNonTranslatedEventsAsText } from '../EventsSheet/EventsTree/TextRenderer';
import { mapFor, mapVector } from '../Utils/MapFor';
import {
  serializeToJSObject,
  serializeToJSON,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import { findEventsInEventsList } from './McpEventTools';
import { generateEventsCodeForScope } from '../EventsSheet/GenerateEventsCode';
import { scanProjectForValidationErrors } from '../Utils/EventsValidationScanner';

const gd: libGDevelop = global.gd;

const hasOwn = (object: Object, propertyName: string): boolean =>
  Object.keys(object).includes(propertyName);

const getOptionalString = (object: any, methodName: string): ?string =>
  object && typeof object[methodName] === 'function'
    ? object[methodName]()
    : undefined;

const getOptionalBoolean = (object: any, methodName: string): ?boolean =>
  object && typeof object[methodName] === 'function'
    ? object[methodName]()
    : undefined;

const setStringIfProvided = (
  target: any,
  setterName: string,
  args: Object,
  argName: string
) => {
  if (
    hasOwn(args, argName) &&
    typeof args[argName] === 'string' &&
    typeof target[setterName] === 'function'
  ) {
    target[setterName](args[argName]);
  }
};

const setBooleanIfProvided = (
  target: any,
  setterName: string,
  args: Object,
  argName: string
) => {
  if (
    hasOwn(args, argName) &&
    typeof args[argName] === 'boolean' &&
    typeof target[setterName] === 'function'
  ) {
    target[setterName](args[argName]);
  }
};

const setNumberIfProvided = (
  target: any,
  setterName: string,
  source: Object,
  argName: string
) => {
  if (
    hasOwn(source, argName) &&
    typeof source[argName] === 'number' &&
    Number.isFinite(source[argName]) &&
    typeof target[setterName] === 'function'
  ) {
    target[setterName](source[argName]);
  }
};

const normalizeRequiredName = (name: any, label: string): string => {
  if (typeof name !== 'string' || !name.trim()) {
    throw new Error(`Missing ${label}.`);
  }

  const safeName = gd.Project.getSafeName(name.trim());
  if (!safeName) {
    throw new Error(`${label} is not a valid GDevelop identifier.`);
  }
  return safeName;
};

const normalizeOptionalName = (name: any, label: string): ?string => {
  if (name === undefined || name === null || name === '') return null;
  return normalizeRequiredName(name, label);
};

const getSafeUniqueName = (
  desiredName: string,
  isNameTaken: string => boolean,
  currentName?: ?string
): string => {
  const baseName = gd.Project.getSafeName(desiredName);
  if (!baseName) {
    throw new Error(`Invalid name: "${desiredName}".`);
  }
  if ((!currentName || baseName !== currentName) && !isNameTaken(baseName)) {
    return baseName;
  }
  if (currentName && baseName === currentName) {
    return currentName;
  }

  let index = 2;
  while (isNameTaken(`${baseName}${index}`)) {
    index++;
  }
  return `${baseName}${index}`;
};

const getFunctionTypeByName = (): Object => ({
  action: gd.EventsFunction.Action,
  condition: gd.EventsFunction.Condition,
  expression: gd.EventsFunction.Expression,
  expression_and_condition: gd.EventsFunction.ExpressionAndCondition,
  expressionandcondition: gd.EventsFunction.ExpressionAndCondition,
  'expression-and-condition': gd.EventsFunction.ExpressionAndCondition,
  action_with_operator: gd.EventsFunction.ActionWithOperator,
  actionwithoperator: gd.EventsFunction.ActionWithOperator,
  'action-with-operator': gd.EventsFunction.ActionWithOperator,
});

const functionTypeToName = (functionType: number): string => {
  switch (functionType) {
    case gd.EventsFunction.Action:
      return 'action';
    case gd.EventsFunction.Condition:
      return 'condition';
    case gd.EventsFunction.Expression:
      return 'expression';
    case gd.EventsFunction.ExpressionAndCondition:
      return 'expression_and_condition';
    case gd.EventsFunction.ActionWithOperator:
      return 'action_with_operator';
    default:
      return `unknown_${functionType}`;
  }
};

const normalizeFunctionType = (
  functionType: any
): ?EventsFunction_FunctionType => {
  if (
    functionType === undefined ||
    functionType === null ||
    functionType === ''
  ) {
    return null;
  }
  if (typeof functionType === 'number' && Number.isInteger(functionType)) {
    return ((functionType: any): EventsFunction_FunctionType);
  }
  if (typeof functionType !== 'string') {
    throw new Error(
      'function_type must be a string or a numeric GDevelop function type.'
    );
  }
  const normalized = functionType
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  const functionTypeByName = getFunctionTypeByName();
  if (!hasOwn(functionTypeByName, normalized)) {
    throw new Error(
      'Unknown function_type. Use action, condition, expression, expression_and_condition, or action_with_operator.'
    );
  }
  return ((functionTypeByName[normalized]: any): EventsFunction_FunctionType);
};

const normalizeParentKind = (parentKind: any): string => {
  if (!parentKind) return 'extension';
  const normalized = String(parentKind)
    .trim()
    .toLowerCase();
  if (normalized === 'free' || normalized === 'global') return 'extension';
  if (
    normalized !== 'extension' &&
    normalized !== 'behavior' &&
    normalized !== 'object'
  ) {
    throw new Error('parent_kind must be extension, behavior, or object.');
  }
  return normalized;
};

const normalizeTargetKind = (targetKind: any): string => {
  const normalized = String(targetKind || '')
    .trim()
    .toLowerCase();
  if (normalized !== 'behavior' && normalized !== 'object') {
    throw new Error('target_kind must be behavior or object.');
  }
  return normalized;
};

const getExtension = (
  project: gdProject,
  extensionName: string
): gdEventsFunctionsExtension => {
  if (!project.hasEventsFunctionsExtensionNamed(extensionName)) {
    throw new Error(`Extension not found: "${extensionName}".`);
  }
  return project.getEventsFunctionsExtension(extensionName);
};

const getVectorStringArray = (vectorString: any): Array<string> => {
  if (!vectorString) return [];
  if (typeof vectorString.toJSArray === 'function') {
    return vectorString.toJSArray();
  }
  return mapVector(vectorString, value => value);
};

const replaceVectorString = (vectorString: any, values: Array<string>) => {
  if (!vectorString || typeof vectorString.clear !== 'function') return;
  vectorString.clear();
  values
    .filter(value => typeof value === 'string' && value.trim())
    .map(value => value.trim())
    .forEach(value => vectorString.push_back(value));
};

const summarizeValueTypeMetadata = (valueTypeMetadata: any): ?Object => {
  if (!valueTypeMetadata) return null;
  return {
    name: getOptionalString(valueTypeMetadata, 'getName') || '',
    extraInfo: getOptionalString(valueTypeMetadata, 'getExtraInfo') || '',
    isOptional: !!getOptionalBoolean(valueTypeMetadata, 'isOptional'),
    defaultValue: getOptionalString(valueTypeMetadata, 'getDefaultValue') || '',
    isObject: !!getOptionalBoolean(valueTypeMetadata, 'isObject'),
    isBehavior: !!getOptionalBoolean(valueTypeMetadata, 'isBehavior'),
    isNumber: !!getOptionalBoolean(valueTypeMetadata, 'isNumber'),
    isString: !!getOptionalBoolean(valueTypeMetadata, 'isString'),
    isVariable: !!getOptionalBoolean(valueTypeMetadata, 'isVariable'),
    isResource: !!getOptionalBoolean(valueTypeMetadata, 'isResource'),
  };
};

const applyValueTypeMetadata = (
  valueTypeMetadata: any,
  valueType: any
): void => {
  if (!valueTypeMetadata || !valueType || typeof valueType !== 'object') return;
  if (typeof valueTypeMetadata.setName === 'function') {
    setStringIfProvided(valueTypeMetadata, 'setName', valueType, 'name');
  }
  setStringIfProvided(
    valueTypeMetadata,
    'setExtraInfo',
    valueType,
    'extra_info'
  );
  setStringIfProvided(
    valueTypeMetadata,
    'setDefaultValue',
    valueType,
    'default_value'
  );
  setBooleanIfProvided(
    valueTypeMetadata,
    'setOptional',
    valueType,
    'is_optional'
  );
};

const summarizeParameter = (
  parameter: gdParameterMetadata,
  index: number
): Object => ({
  index,
  name: parameter.getName(),
  type: parameter.getType(),
  description: parameter.getDescription(),
  longDescription: parameter.getLongDescription(),
  hint: getOptionalString(parameter, 'getHint') || undefined,
  extraInfo: getOptionalString(parameter, 'getExtraInfo') || undefined,
  defaultValue: getOptionalString(parameter, 'getDefaultValue') || undefined,
  isOptional: !!getOptionalBoolean(parameter, 'isOptional'),
  isCodeOnly: !!getOptionalBoolean(parameter, 'isCodeOnly'),
  valueType: summarizeValueTypeMetadata(parameter.getValueTypeMetadata()),
});

const summarizeParameters = (
  parameters: gdParameterMetadataContainer
): Array<Object> =>
  mapFor(0, parameters.getParametersCount(), index =>
    summarizeParameter(parameters.getParameterAt(index), index)
  );

const summarizeProperty = (
  property: gdNamedPropertyDescriptor,
  index: number,
  includeSerialized: boolean = true
): Object => {
  const summary: Object = {
    index,
    name: property.getName(),
    type: property.getType(),
    value: property.getValue(),
    label: property.getLabel(),
    description: property.getDescription(),
    measurementUnit: getOptionalString(property, 'getMeasurementUnit') || '',
    group: getOptionalString(property, 'getGroup') || '',
    isHidden: !!getOptionalBoolean(property, 'isHidden'),
    isAdvanced: !!getOptionalBoolean(property, 'isAdvanced'),
    isDeprecated: !!getOptionalBoolean(property, 'isDeprecated'),
    extraInfo: getVectorStringArray(property.getExtraInfo()),
    choices: mapVector(property.getChoices(), choice => ({
      value: choice.getValue(),
      label: choice.getLabel(),
    })),
  };
  if (includeSerialized) {
    summary.serializedProperty = serializeToJSObject(property);
  }
  return summary;
};

const summarizeProperties = (
  properties: gdPropertiesContainer,
  includeSerialized: boolean = true
): Array<Object> =>
  mapFor(0, properties.getCount(), index =>
    summarizeProperty(properties.getAt(index), index, includeSerialized)
  );

const summarizeEventsFunction = (
  eventsFunction: gdEventsFunction,
  includeEvents: boolean = true,
  includeSerialized: boolean = true
): Object => {
  const events = eventsFunction.getEvents();
  const summary: Object = {
    name: eventsFunction.getName(),
    functionType: functionTypeToName(eventsFunction.getFunctionType()),
    functionTypeValue: eventsFunction.getFunctionType(),
    fullName: eventsFunction.getFullName(),
    description: eventsFunction.getDescription(),
    sentence: eventsFunction.getSentence(),
    helpUrl: eventsFunction.getHelpUrl(),
    isPrivate: eventsFunction.isPrivate(),
    isAsync: eventsFunction.isAsync(),
    isDeprecated: eventsFunction.isDeprecated(),
    deprecationMessage: eventsFunction.getDeprecationMessage(),
    expressionType: summarizeValueTypeMetadata(
      eventsFunction.getExpressionType()
    ),
    parameters: summarizeParameters(eventsFunction.getParameters()),
    eventsCount: events.getEventsCount(),
    eventsAsText: includeEvents
      ? renderNonTranslatedEventsAsText({ eventsList: events })
      : undefined,
    eventsJson: includeEvents ? serializeToJSON(events) : undefined,
  };
  if (includeSerialized) {
    summary.serializedFunction = serializeToJSObject(eventsFunction);
  }
  return summary;
};

type ExtensionEventReference = {|
  event: gdBaseEvent,
  parentList: gdEventsList,
  index: number,
  path: Array<number>,
|};

type ExtensionInstructionReference = {|
  instruction: gdInstruction,
  instructionKind: 'action' | 'condition',
  instructionPath: Array<number>,
|};

type ExtensionFunctionTarget = {
  extension: gdEventsFunctionsExtension,
  parentKind: string,
  parent:
    | gdEventsFunctionsExtension
    | gdEventsBasedBehavior
    | gdEventsBasedObject,
  eventsFunction: gdEventsFunction,
  container?: gdEventsFunctionsContainer,
};

const formatEventPath = (path: Array<number>): string =>
  `event-${path.join('.')}`;

const parseEventPath = (eventPath: string): Array<number> => {
  const pathString = eventPath.startsWith('event-')
    ? eventPath.slice('event-'.length)
    : eventPath;
  if (!pathString) {
    throw new Error(`Invalid event path: "${eventPath}".`);
  }
  const parts = pathString.split('.').map(part => Number(part));
  if (
    !parts.length ||
    parts.some(part => !Number.isInteger(part) || part < 0)
  ) {
    throw new Error(`Invalid event path: "${eventPath}".`);
  }
  return parts;
};

const collectEventReferences = (
  eventsList: gdEventsList,
  parentPath: Array<number> = []
): Array<ExtensionEventReference> => {
  const references = [];
  for (let index = 0; index < eventsList.getEventsCount(); index++) {
    const event = eventsList.getEventAt(index);
    const path = [...parentPath, index];
    references.push({
      event,
      parentList: eventsList,
      index,
      path,
    });
    if (event.canHaveSubEvents()) {
      references.push(...collectEventReferences(event.getSubEvents(), path));
    }
  }
  return references;
};

const getInstructionSummaries = (
  instructionsList: gdInstructionsList
): Array<Object> => {
  const instructions = [];
  for (let index = 0; index < instructionsList.size(); index++) {
    const instruction = instructionsList.get(index);
    const parameters: Array<string> = [];
    for (
      let parameterIndex = 0;
      parameterIndex < instruction.getParametersCount();
      parameterIndex++
    ) {
      parameters.push(
        instruction.getParameter(parameterIndex).getPlainString()
      );
    }
    const subInstructions = instruction.getSubInstructions();
    instructions.push({
      index,
      type: instruction.getType(),
      parameters,
      subInstructionsCount: subInstructions ? subInstructions.size() : 0,
    });
  }
  return instructions;
};

const getEventInstructions = (
  event: gdBaseEvent
): {| conditions: Array<Object>, actions: Array<Object> |} => {
  const eventType = event.getType();
  if (eventType === 'BuiltinCommonInstructions::Standard') {
    const standardEvent = gd.asStandardEvent(event);
    return {
      conditions: getInstructionSummaries(standardEvent.getConditions()),
      actions: getInstructionSummaries(standardEvent.getActions()),
    };
  }
  if (eventType === 'BuiltinCommonInstructions::While') {
    const whileEvent = gd.asWhileEvent(event);
    return {
      conditions: getInstructionSummaries(whileEvent.getWhileConditions()),
      actions: getInstructionSummaries(whileEvent.getActions()),
    };
  }
  return {
    conditions: [],
    actions: [],
  };
};

const serializeSingleEventToJSObject = (event: gdBaseEvent): Object => {
  const eventsList = new gd.EventsList();
  try {
    eventsList.insertEvent(event, 0);
    const serializedEvents = serializeToJSObject(eventsList);
    if (Array.isArray(serializedEvents) && serializedEvents[0]) {
      return serializedEvents[0];
    }
    return serializeToJSObject(event);
  } finally {
    eventsList.delete();
  }
};

const summarizeCompactEventReference = (
  reference: ExtensionEventReference
): Object => {
  const event = reference.event;
  const eventType = event.getType();
  const instructions = getEventInstructions(event);
  const summary: Object = {
    eventPath: formatEventPath(reference.path),
    path: reference.path,
    type: eventType,
    aiGeneratedEventId: event.getAiGeneratedEventId() || null,
    conditions: instructions.conditions,
    actions: instructions.actions,
    subEventsCount: event.canHaveSubEvents()
      ? event.getSubEvents().getEventsCount()
      : 0,
  };
  if (eventType === 'BuiltinCommonInstructions::Group') {
    summary.groupName = gd.asGroupEvent(event).getName();
  } else if (eventType === 'BuiltinCommonInstructions::Comment') {
    summary.comment = serializeSingleEventToJSObject(event).comment || '';
  } else if (eventType === 'BuiltinCommonInstructions::JsCode') {
    const serializedEvent = serializeSingleEventToJSObject(event);
    const code =
      typeof serializedEvent.inlineCode === 'string'
        ? serializedEvent.inlineCode
        : typeof serializedEvent.code === 'string'
        ? serializedEvent.code
        : '';
    summary.javascript = {
      lines: code.split('\n').slice(0, 5),
      lineCount: code ? code.split('\n').length : 0,
    };
  }
  return summary;
};

const summarizeEventsFunctionCompact = (
  eventsFunction: gdEventsFunction
): Object => ({
  name: eventsFunction.getName(),
  functionType: functionTypeToName(eventsFunction.getFunctionType()),
  functionTypeValue: eventsFunction.getFunctionType(),
  fullName: eventsFunction.getFullName(),
  description: eventsFunction.getDescription(),
  sentence: eventsFunction.getSentence(),
  isPrivate: eventsFunction.isPrivate(),
  isAsync: eventsFunction.isAsync(),
  isDeprecated: eventsFunction.isDeprecated(),
  deprecationMessage: eventsFunction.getDeprecationMessage(),
  parameters: summarizeParameters(eventsFunction.getParameters()),
  eventsCount: eventsFunction.getEvents().getEventsCount(),
  events: collectEventReferences(eventsFunction.getEvents()).map(reference =>
    summarizeCompactEventReference(reference)
  ),
});

const getEventsFunctionSentenceValidation = (
  parentKind: string,
  eventsFunction: gdEventsFunction
): {|
  valid: boolean,
  skipped: boolean,
  missingParameters: Array<string>,
  nonExpectedParameters: Array<string>,
  errorMessage?: string,
|} => {
  const type = eventsFunction.getFunctionType();
  if (
    type !== gd.EventsFunction.Action &&
    type !== gd.EventsFunction.Condition &&
    type !== gd.EventsFunction.ExpressionAndCondition
  ) {
    return {
      valid: true,
      skipped: true,
      missingParameters: [],
      nonExpectedParameters: [],
    };
  }

  const sentence = eventsFunction.getSentence();
  if (!sentence) {
    return {
      valid: true,
      skipped: true,
      missingParameters: [],
      nonExpectedParameters: [],
    };
  }

  const parametersIndexOffset = parentKind === 'extension' ? 1 : 0;
  const param0isImplicit =
    parentKind !== 'extension' &&
    type === gd.EventsFunction.ExpressionAndCondition;
  const parameters = eventsFunction.getParameters();
  const parametersCount = parameters.getParametersCount();
  const missingParameters = [];
  for (let index = 0; index < parametersCount; index++) {
    const parameter = parameters.getParameterAt(index);
    const isBehaviorParameter =
      parameter.getType() === 'behavior' ||
      parameter.getValueTypeMetadata().isBehavior();

    if (isBehaviorParameter) {
      // Behavior parameters are implicit implementation details in sentences.
      continue;
    }
    if (index === 0 && param0isImplicit) {
      continue;
    }

    const expectedString = `_PARAM${index + parametersIndexOffset}_`;
    if (sentence.indexOf(expectedString) === -1) {
      missingParameters.push(expectedString);
    }
  }

  const paramsMatches = sentence.matchAll(/_PARAM(\d+)_/g);
  const nonExpectedParameters = [];
  for (const paramsMatch of paramsMatches) {
    const paramIndex = parseInt(paramsMatch[1], 10);
    const actualParameterIndex = paramIndex - parametersIndexOffset;
    if (
      actualParameterIndex >= parametersCount ||
      actualParameterIndex < 0
    ) {
      nonExpectedParameters.push(paramsMatch[0]);
    }
  }

  const valid = !missingParameters.length && !nonExpectedParameters.length;
  const sentenceErrors = [];
  if (missingParameters.length) {
    sentenceErrors.push(
      `The sentence is probably missing this/these parameter(s): ${missingParameters.join(
        ', '
      )}`
    );
  }
  if (nonExpectedParameters.length) {
    sentenceErrors.push(
      `The sentence displays one or more wrong parameters: ${nonExpectedParameters.join(
        ', '
      )}`
    );
  }

  return {
    valid,
    skipped: false,
    missingParameters,
    nonExpectedParameters,
    errorMessage: valid ? undefined : sentenceErrors.join(' - '),
  };
};

const assertEventsFunctionSentenceIsValid = (
  parentKind: string,
  eventsFunction: gdEventsFunction
) => {
  const validation = getEventsFunctionSentenceValidation(
    parentKind,
    eventsFunction
  );
  if (!validation.valid) {
    throw new Error(
      `Invalid extension function sentence for "${eventsFunction.getName()}": ${validation.errorMessage ||
        'Invalid parameter placeholders.'}`
    );
  }
};

const summarizeFunctions = (
  container: gdEventsFunctionsContainer,
  includeEvents: boolean = true,
  includeSerialized: boolean = true
): Array<Object> =>
  mapFor(0, container.getEventsFunctionsCount(), index =>
    summarizeEventsFunction(
      container.getEventsFunctionAt(index),
      includeEvents,
      includeSerialized
    )
  );

const summarizeBehavior = (
  behavior: gdEventsBasedBehavior,
  includeEvents: boolean = true,
  includeSerialized: boolean = true
): Object => {
  const summary: Object = {
    name: behavior.getName(),
    fullName: behavior.getFullName(),
    description: behavior.getDescription(),
    objectType: behavior.getObjectType(),
    isPrivate: behavior.isPrivate(),
    iconUrl: getOptionalString(behavior, 'getIconUrl') || '',
    previewIconUrl: getOptionalString(behavior, 'getPreviewIconUrl') || '',
    properties: summarizeProperties(
      behavior.getPropertyDescriptors(),
      includeSerialized
    ),
    sharedProperties: summarizeProperties(
      behavior.getSharedPropertyDescriptors(),
      includeSerialized
    ),
    functions: summarizeFunctions(
      behavior.getEventsFunctions(),
      includeEvents,
      includeSerialized
    ),
  };
  if (includeSerialized) {
    summary.serializedBehavior = serializeToJSObject(behavior);
  }
  return summary;
};

const summarizeBehaviors = (
  extension: gdEventsFunctionsExtension,
  includeEvents: boolean = true,
  includeSerialized: boolean = true
): Array<Object> => {
  const behaviors = extension.getEventsBasedBehaviors();
  return mapFor(0, behaviors.getCount(), index =>
    summarizeBehavior(behaviors.getAt(index), includeEvents, includeSerialized)
  );
};

const summarizeObject = (
  object: gdEventsBasedObject,
  includeEvents: boolean = true,
  includeSerialized: boolean = true
): Object => {
  const summary: Object = {
    name: object.getName(),
    fullName: object.getFullName(),
    description: object.getDescription(),
    defaultName: object.getDefaultName(),
    isRenderedIn3D: object.isRenderedIn3D(),
    isPrivate: object.isPrivate(),
    isInnerAreaFollowingParentSize: object.isInnerAreaFollowingParentSize(),
    isTextContainer: object.isTextContainer(),
    isAnimatable: object.isAnimatable(),
    iconUrl: getOptionalString(object, 'getIconUrl') || '',
    previewIconUrl: getOptionalString(object, 'getPreviewIconUrl') || '',
    area: {
      minX: object.getAreaMinX(),
      minY: object.getAreaMinY(),
      minZ: object.getAreaMinZ(),
      maxX: object.getAreaMaxX(),
      maxY: object.getAreaMaxY(),
      maxZ: object.getAreaMaxZ(),
    },
    childObjectsCount: object.getObjects().getObjectsCount(),
    initialInstancesCount: object.getInitialInstances().getInstancesCount(),
    variantsCount: object.getVariants().getVariantsCount(),
    properties: summarizeProperties(
      object.getPropertyDescriptors(),
      includeSerialized
    ),
    functions: summarizeFunctions(
      object.getEventsFunctions(),
      includeEvents,
      includeSerialized
    ),
  };
  if (includeSerialized) {
    summary.serializedObject = serializeToJSObject(object);
  }
  return summary;
};

const summarizeObjects = (
  extension: gdEventsFunctionsExtension,
  includeEvents: boolean = true,
  includeSerialized: boolean = true
): Array<Object> => {
  const objects = extension.getEventsBasedObjects();
  return mapFor(0, objects.getCount(), index =>
    summarizeObject(objects.getAt(index), includeEvents, includeSerialized)
  );
};

const summarizeExtension = (extension: gdEventsFunctionsExtension): Object => ({
  name: extension.getName(),
  namespace: extension.getNamespace(),
  fullName: extension.getFullName(),
  shortDescription: extension.getShortDescription(),
  description: extension.getDescription(),
  version: extension.getVersion(),
  category: extension.getCategory(),
  dimension: extension.getDimension(),
  helpPath: extension.getHelpPath(),
  iconUrl: extension.getIconUrl(),
  previewIconUrl: extension.getPreviewIconUrl(),
  tags: getVectorStringArray(extension.getTags()),
  freeFunctionsCount: extension.getEventsFunctions().getEventsFunctionsCount(),
  behaviorsCount: extension.getEventsBasedBehaviors().getCount(),
  objectsCount: extension.getEventsBasedObjects().getCount(),
});

export const listProjectExtensions = (project: gdProject): Object => ({
  extensions: mapFor(0, project.getEventsFunctionsExtensionsCount(), index =>
    summarizeExtension(project.getEventsFunctionsExtensionAt(index))
  ),
});

const getInspectOptions = (
  args: Object
): {| includeEvents: boolean, includeSerialized: boolean |} => {
  const compactMode = !!(
    args &&
    (args.compact ||
      args.summary_only ||
      args.list_functions_only ||
      args.list_objects_only ||
      args.list_behaviors_only)
  );
  return {
    includeEvents:
      args && args.include_events !== undefined
        ? !!args.include_events
        : !compactMode,
    includeSerialized:
      args && args.include_serialized !== undefined
        ? !!args.include_serialized
        : !compactMode,
  };
};

const listExtensionFunctions = (
  extension: gdEventsFunctionsExtension,
  includeEvents: boolean,
  includeSerialized: boolean
): Array<Object> => {
  const functions = summarizeFunctions(
    extension.getEventsFunctions(),
    includeEvents,
    includeSerialized
  ).map(eventsFunction => ({
    scope: 'extension',
    parentKind: 'extension',
    parentName: null,
    ...eventsFunction,
  }));

  const behaviors = extension.getEventsBasedBehaviors();
  for (let index = 0; index < behaviors.getCount(); index++) {
    const behavior = behaviors.getAt(index);
    summarizeFunctions(
      behavior.getEventsFunctions(),
      includeEvents,
      includeSerialized
    ).forEach(eventsFunction =>
      functions.push({
        scope: 'behavior',
        parentKind: 'behavior',
        parentName: behavior.getName(),
        ...eventsFunction,
      })
    );
  }

  const objects = extension.getEventsBasedObjects();
  for (let index = 0; index < objects.getCount(); index++) {
    const object = objects.getAt(index);
    summarizeFunctions(
      object.getEventsFunctions(),
      includeEvents,
      includeSerialized
    ).forEach(eventsFunction =>
      functions.push({
        scope: 'object',
        parentKind: 'object',
        parentName: object.getName(),
        ...eventsFunction,
      })
    );
  }

  return functions;
};

export const inspectProjectExtension = (
  project: gdProject,
  args: Object
): Object => {
  const extensionName = normalizeRequiredName(
    args.extension_name,
    'extension_name'
  );
  const extension = getExtension(project, extensionName);
  const { includeEvents, includeSerialized } = getInspectOptions(args || {});
  const summaryOnly = !!(args && args.summary_only);
  const listFunctionsOnly = !!(args && args.list_functions_only);
  const listObjectsOnly = !!(args && args.list_objects_only);
  const listBehaviorsOnly = !!(args && args.list_behaviors_only);

  if (summaryOnly) {
    return {
      extension: summarizeExtension(extension),
      mode: 'summary_only',
      freeFunctions: mapFor(
        0,
        extension.getEventsFunctions().getEventsFunctionsCount(),
        index => extension.getEventsFunctions().getEventsFunctionAt(index).getName()
      ),
      behaviors: mapFor(0, extension.getEventsBasedBehaviors().getCount(), index => {
        const behavior = extension.getEventsBasedBehaviors().getAt(index);
        return {
          name: behavior.getName(),
          functionsCount: behavior
            .getEventsFunctions()
            .getEventsFunctionsCount(),
          propertiesCount: behavior.getPropertyDescriptors().getCount(),
          sharedPropertiesCount: behavior
            .getSharedPropertyDescriptors()
            .getCount(),
        };
      }),
      objects: mapFor(0, extension.getEventsBasedObjects().getCount(), index => {
        const object = extension.getEventsBasedObjects().getAt(index);
        return {
          name: object.getName(),
          functionsCount: object.getEventsFunctions().getEventsFunctionsCount(),
          childObjectsCount: object.getObjects().getObjectsCount(),
          initialInstancesCount: object
            .getInitialInstances()
            .getInstancesCount(),
          propertiesCount: object.getPropertyDescriptors().getCount(),
        };
      }),
    };
  }

  if (listFunctionsOnly) {
    return {
      extension: summarizeExtension(extension),
      mode: 'list_functions_only',
      functions: listExtensionFunctions(
        extension,
        includeEvents,
        includeSerialized
      ),
    };
  }

  if (listObjectsOnly) {
    return {
      extension: summarizeExtension(extension),
      mode: 'list_objects_only',
      objects: summarizeObjects(extension, includeEvents, includeSerialized),
    };
  }

  if (listBehaviorsOnly) {
    return {
      extension: summarizeExtension(extension),
      mode: 'list_behaviors_only',
      behaviors: summarizeBehaviors(
        extension,
        includeEvents,
        includeSerialized
      ),
    };
  }

  return {
    extension: summarizeExtension(extension),
    freeFunctions: summarizeFunctions(
      extension.getEventsFunctions(),
      includeEvents,
      includeSerialized
    ),
    behaviors: summarizeBehaviors(extension, includeEvents, includeSerialized),
    objects: summarizeObjects(extension, includeEvents, includeSerialized),
    serializedExtension: includeSerialized
      ? serializeToJSObject(extension)
      : undefined,
  };
};

const getFunctionParent = (
  project: gdProject,
  args: Object
): {|
  extension: gdEventsFunctionsExtension,
  parentKind: string,
  parent:
    | gdEventsFunctionsExtension
    | gdEventsBasedBehavior
    | gdEventsBasedObject,
  container: gdEventsFunctionsContainer,
|} => {
  const extensionName = normalizeRequiredName(
    args.extension_name,
    'extension_name'
  );
  const extension = getExtension(project, extensionName);
  const parentKind = normalizeParentKind(args.parent_kind);

  if (parentKind === 'extension') {
    return {
      extension,
      parentKind,
      parent: extension,
      container: extension.getEventsFunctions(),
    };
  }

  const parentName = normalizeRequiredName(args.parent_name, 'parent_name');
  if (parentKind === 'behavior') {
    const behaviors = extension.getEventsBasedBehaviors();
    if (!behaviors.has(parentName)) {
      throw new Error(`Events-based behavior not found: "${parentName}".`);
    }
    const behavior = behaviors.get(parentName);
    return {
      extension,
      parentKind,
      parent: behavior,
      container: behavior.getEventsFunctions(),
    };
  }

  const objects = extension.getEventsBasedObjects();
  if (!objects.has(parentName)) {
    throw new Error(`Events-based object not found: "${parentName}".`);
  }
  const object = objects.get(parentName);
  return {
    extension,
    parentKind,
    parent: object,
    container: object.getEventsFunctions(),
  };
};

export const inspectExtensionFunction = (
  project: gdProject,
  args: Object
): Object => {
  const { parentKind, container } = getFunctionParent(project, args);
  const { includeEvents, includeSerialized } = getInspectOptions(args || {});
  const functionName = normalizeRequiredName(
    args.function_name,
    'function_name'
  );
  if (!container.hasEventsFunctionNamed(functionName)) {
    throw new Error(`Events function not found: "${functionName}".`);
  }

  if (args && args.compact === true) {
    return {
      parentKind,
      function: summarizeEventsFunctionCompact(
        container.getEventsFunction(functionName)
      ),
    };
  }

  return {
    parentKind,
    function: summarizeEventsFunction(
      container.getEventsFunction(functionName),
      includeEvents,
      includeSerialized
    ),
  };
};

export const inspectExtensionBehavior = (
  project: gdProject,
  args: Object
): Object => {
  const extensionName = normalizeRequiredName(
    args.extension_name,
    'extension_name'
  );
  const behaviorName = normalizeRequiredName(
    args.behavior_name,
    'behavior_name'
  );
  const behaviors = getExtension(
    project,
    extensionName
  ).getEventsBasedBehaviors();
  if (!behaviors.has(behaviorName)) {
    throw new Error(`Events-based behavior not found: "${behaviorName}".`);
  }
  const { includeEvents, includeSerialized } = getInspectOptions(args || {});
  return {
    behavior: summarizeBehavior(
      behaviors.get(behaviorName),
      includeEvents,
      includeSerialized
    ),
  };
};

export const inspectExtensionObject = (
  project: gdProject,
  args: Object
): Object => {
  const extensionName = normalizeRequiredName(
    args.extension_name,
    'extension_name'
  );
  const objectName = normalizeRequiredName(args.object_name, 'object_name');
  const objects = getExtension(project, extensionName).getEventsBasedObjects();
  if (!objects.has(objectName)) {
    throw new Error(`Events-based object not found: "${objectName}".`);
  }
  const { includeEvents, includeSerialized } = getInspectOptions(args || {});
  return {
    object: summarizeObject(
      objects.get(objectName),
      includeEvents,
      includeSerialized
    ),
  };
};

const getSearchLimit = (args: Object, defaultLimit: number = 100): number =>
  typeof args.limit === 'number' && Number.isFinite(args.limit)
    ? Math.max(1, Math.min(500, Math.floor(args.limit)))
    : defaultLimit;

const addExtensionFunctionEventSources = (
  extensionName: string,
  parentKind: string,
  parentName: ?string,
  container: gdEventsFunctionsContainer,
  args: Object,
  sources: Array<Object>
) => {
  const requestedParentKind =
    args && typeof args.parent_kind === 'string'
      ? normalizeParentKind(args.parent_kind)
      : null;
  if (requestedParentKind && requestedParentKind !== parentKind) return;

  const requestedParentName =
    args && typeof args.parent_name === 'string'
      ? normalizeRequiredName(args.parent_name, 'parent_name')
      : null;
  if (requestedParentName && requestedParentName !== parentName) return;

  const requestedFunctionName =
    args && typeof args.function_name === 'string'
      ? normalizeRequiredName(args.function_name, 'function_name')
      : null;

  for (let index = 0; index < container.getEventsFunctionsCount(); index++) {
    const eventsFunction = container.getEventsFunctionAt(index);
    if (
      requestedFunctionName &&
      requestedFunctionName !== eventsFunction.getName()
    ) {
      continue;
    }
    sources.push({
      eventsList: eventsFunction.getEvents(),
      owner: {
        scope: 'extension',
        extensionName,
        parentKind,
        parentName,
        functionName: eventsFunction.getName(),
        functionType: functionTypeToName(eventsFunction.getFunctionType()),
      },
    });
  }
};

const collectExtensionEventSources = (
  extension: gdEventsFunctionsExtension,
  args: Object
): Array<Object> => {
  const extensionName = extension.getName();
  const sources: Array<Object> = [];
  addExtensionFunctionEventSources(
    extensionName,
    'extension',
    null,
    extension.getEventsFunctions(),
    args,
    sources
  );

  const behaviors = extension.getEventsBasedBehaviors();
  for (let index = 0; index < behaviors.getCount(); index++) {
    const behavior = behaviors.getAt(index);
    addExtensionFunctionEventSources(
      extensionName,
      'behavior',
      behavior.getName(),
      behavior.getEventsFunctions(),
      args,
      sources
    );
  }

  const objects = extension.getEventsBasedObjects();
  for (let index = 0; index < objects.getCount(); index++) {
    const object = objects.getAt(index);
    addExtensionFunctionEventSources(
      extensionName,
      'object',
      object.getName(),
      object.getEventsFunctions(),
      args,
      sources
    );
  }

  return sources;
};

export const findExtensionEvents = (
  project: gdProject,
  args: Object
): Object => {
  const extensionName = normalizeRequiredName(
    args.extension_name,
    'extension_name'
  );
  const extension = getExtension(project, extensionName);
  const limit = getSearchLimit(args);
  const matches = [];
  collectExtensionEventSources(extension, args).forEach(source => {
    findEventsInEventsList({
      eventsList: source.eventsList,
      args,
      owner: source.owner,
      defaultIncludeSerialized: false,
    }).forEach(match => matches.push(match));
  });

  return {
    success: true,
    extensionName,
    count: Math.min(matches.length, limit),
    totalMatches: matches.length,
    truncated: matches.length > limit,
    matches: matches.slice(0, limit),
  };
};

export const findProjectEvents = (
  project: gdProject,
  args: Object
): Object => {
  const limit = getSearchLimit(args);
  const matches = [];
  const sceneName =
    args && typeof args.scene_name === 'string' ? args.scene_name : null;
  for (let index = 0; index < project.getLayoutsCount(); index++) {
    const scene = project.getLayoutAt(index);
    if (sceneName && scene.getName() !== sceneName) continue;
    findEventsInEventsList({
      eventsList: scene.getEvents(),
      args,
      owner: { scope: 'scene', sceneName: scene.getName() },
      defaultIncludeSerialized: false,
    }).forEach(match => matches.push(match));
  }

  const extensionName =
    args && typeof args.extension_name === 'string'
      ? normalizeRequiredName(args.extension_name, 'extension_name')
      : null;
  for (
    let index = 0;
    index < project.getEventsFunctionsExtensionsCount();
    index++
  ) {
    const extension = project.getEventsFunctionsExtensionAt(index);
    if (extensionName && extension.getName() !== extensionName) continue;
    collectExtensionEventSources(extension, args).forEach(source => {
      findEventsInEventsList({
        eventsList: source.eventsList,
        args,
        owner: source.owner,
        defaultIncludeSerialized: false,
      }).forEach(match => matches.push(match));
    });
  }

  return {
    success: true,
    count: Math.min(matches.length, limit),
    totalMatches: matches.length,
    truncated: matches.length > limit,
    matches: matches.slice(0, limit),
  };
};

const getFunctionParentName = (target: ExtensionFunctionTarget): ?string =>
  target.parentKind === 'extension'
    ? null
    : target.parent && ((target.parent: any): gdEventsBasedBehavior).getName();

const getExtensionFunctionTarget = (
  project: gdProject,
  args: Object
): ExtensionFunctionTarget => {
  const { extension, parentKind, parent, container } = getFunctionParent(
    project,
    args
  );
  const functionName = normalizeRequiredName(
    args.function_name,
    'function_name'
  );
  if (!container.hasEventsFunctionNamed(functionName)) {
    throw new Error(`Events function not found: "${functionName}".`);
  }
  return {
    extension,
    parentKind,
    parent,
    container,
    eventsFunction: container.getEventsFunction(functionName),
  };
};

const isProjectValidationErrorForTarget = (
  error: Object,
  target: ExtensionFunctionTarget
): boolean => {
  if (!error || error.locationType !== 'extension') return false;
  if (error.extensionName !== target.extension.getName()) return false;
  if (error.functionName !== target.eventsFunction.getName()) return false;
  const parentName = getFunctionParentName(target);
  if (target.parentKind === 'behavior') {
    return error.behaviorName === parentName;
  }
  if (target.parentKind === 'object') {
    return error.objectName === parentName;
  }
  return !error.behaviorName && !error.objectName;
};

const collectInstructionReferences = (
  instructionsList: gdInstructionsList,
  path: Array<number> = []
): Array<{| instruction: gdInstruction, path: Array<number> |}> => {
  const references: Array<{|
    instruction: gdInstruction,
    path: Array<number>,
  |}> = [];
  for (let index = 0; index < instructionsList.size(); index++) {
    const instruction = instructionsList.get(index);
    const instructionPath = [...path, index];
    references.push({ instruction, path: instructionPath });
    const subInstructions = instruction.getSubInstructions();
    if (subInstructions && subInstructions.size()) {
      references.push(
        ...collectInstructionReferences(subInstructions, instructionPath)
      );
    }
  }
  return references;
};

const collectEventInstructionReferences = (
  event: gdBaseEvent
): Array<ExtensionInstructionReference> => {
  const eventType = event.getType();
  const references: Array<ExtensionInstructionReference> = [];
  if (eventType === 'BuiltinCommonInstructions::Standard') {
    const standardEvent = gd.asStandardEvent(event);
    collectInstructionReferences(standardEvent.getConditions()).forEach(
      reference =>
        references.push({
          instruction: reference.instruction,
          instructionKind: 'condition',
          instructionPath: reference.path,
        })
    );
    collectInstructionReferences(standardEvent.getActions()).forEach(
      reference =>
        references.push({
          instruction: reference.instruction,
          instructionKind: 'action',
          instructionPath: reference.path,
        })
    );
  } else if (eventType === 'BuiltinCommonInstructions::While') {
    const whileEvent = gd.asWhileEvent(event);
    collectInstructionReferences(whileEvent.getWhileConditions()).forEach(
      reference =>
        references.push({
          instruction: reference.instruction,
          instructionKind: 'condition',
          instructionPath: reference.path,
        })
    );
    collectInstructionReferences(whileEvent.getConditions()).forEach(
      reference =>
        references.push({
          instruction: reference.instruction,
          instructionKind: 'condition',
          instructionPath: reference.path,
        })
    );
    collectInstructionReferences(whileEvent.getActions()).forEach(reference =>
      references.push({
        instruction: reference.instruction,
        instructionKind: 'action',
        instructionPath: reference.path,
      })
    );
  }
  return references;
};

const getMetadataForInstruction = (
  project: gdProject,
  instruction: gdInstruction,
  instructionKind: 'action' | 'condition'
): ?gdInstructionMetadata => {
  const type = instruction.getType();
  if (!type) return null;
  const metadata =
    instructionKind === 'condition'
      ? gd.MetadataProvider.getConditionMetadata(project.getCurrentPlatform(), type)
      : gd.MetadataProvider.getActionMetadata(project.getCurrentPlatform(), type);
  return gd.MetadataProvider.isBadInstructionMetadata(metadata)
    ? null
    : metadata;
};

const isInstructionVisibleForExtensionFunction = ({
  metadata,
  eventsFunction,
  parentKind,
}: {|
  metadata: gdInstructionMetadata,
  eventsFunction: gdEventsFunction,
  parentKind: string,
|}): boolean =>
  (metadata.isRelevantForFunctionEvents() && !!eventsFunction) ||
  (metadata.isRelevantForAsynchronousFunctionEvents() &&
    !!eventsFunction &&
    eventsFunction.isAsync()) ||
  (metadata.isRelevantForCustomObjectEvents() && parentKind === 'object');

const collectInstructionScopeIssues = ({
  project,
  parentKind,
  eventsFunction,
}: {|
  project: gdProject,
  parentKind: string,
  eventsFunction: gdEventsFunction,
|}): Array<Object> => {
  const issues: Array<Object> = [];
  collectEventReferences(eventsFunction.getEvents()).forEach(eventReference => {
    collectEventInstructionReferences(eventReference.event).forEach(
      instructionReference => {
        const metadata = getMetadataForInstruction(
          project,
          instructionReference.instruction,
          instructionReference.instructionKind
        );
        if (!metadata) return;
        const instructionType = instructionReference.instruction.getType();
        if (
          !isInstructionVisibleForExtensionFunction({
            metadata,
            eventsFunction,
            parentKind,
          })
        ) {
          issues.push({
            severity: 'error',
            type: 'instruction-not-visible-in-extension-function',
            instructionType,
            instructionKind: instructionReference.instructionKind,
            eventPath: eventReference.path,
            instructionPath: instructionReference.instructionPath,
            suggestion:
              'Use an instruction that is relevant for extension function events. Instructions that are not relevant to the current function scope render with GDevelop warning/deprecated styling and can be ignored or compiled incorrectly.',
          });
        } else if (metadata.isHidden()) {
          issues.push({
            severity: 'error',
            type: 'hidden-instruction-in-extension-function',
            instructionType,
            instructionKind: instructionReference.instructionKind,
            eventPath: eventReference.path,
            instructionPath: instructionReference.instructionPath,
            deprecationMessage: metadata.getDeprecationMessage() || undefined,
            suggestion:
              metadata.getDeprecationMessage() ||
              'Use a currently visible instruction instead of hidden/deprecated metadata.',
          });
        } else if (metadata.getDeprecationMessage()) {
          issues.push({
            severity: 'warning',
            type: 'deprecated-instruction-in-extension-function',
            instructionType,
            instructionKind: instructionReference.instructionKind,
            eventPath: eventReference.path,
            instructionPath: instructionReference.instructionPath,
            deprecationMessage: metadata.getDeprecationMessage(),
            suggestion:
              metadata.getDeprecationMessage() ||
              'Use a non-deprecated instruction when possible.',
          });
        }
      }
    );
  });
  return issues;
};

const DIRECT_VARIABLE_PARAMETER_INSTRUCTION_TYPES = new Set([
  'NumberVariable',
  'StringVariable',
  'BooleanVariable',
  'SetNumberVariable',
  'SetStringVariable',
  'SetBooleanVariable',
]);

const FUNCTION_VARIABLE_PARAMETER_SUGGESTION =
  'Inside extension functions, variable parameters are function arguments, not scene/local variables. Use CopyArgumentToVariable2 to copy the argument into an event-local variable, read/write that local variable with NumberVariable/SetNumberVariable, then use CopyVariableToArgument2 to write the local value back when needed.';

const getFunctionVariableParameterNames = (
  eventsFunction: gdEventsFunction
): Set<string> => {
  const variableParameterNames: Set<string> = new Set();
  const parameters = eventsFunction.getParameters();
  for (let index = 0; index < parameters.getParametersCount(); index++) {
    const parameter = parameters.getParameterAt(index);
    const valueTypeMetadata = parameter.getValueTypeMetadata();
    if (
      parameter.getType() === 'variable' ||
      (valueTypeMetadata && valueTypeMetadata.isVariable())
    ) {
      variableParameterNames.add(parameter.getName());
    }
  }
  return variableParameterNames;
};

const collectFunctionVariableParameterMisuseIssues = (
  eventsFunction: gdEventsFunction
): Array<Object> => {
  const variableParameterNames = getFunctionVariableParameterNames(
    eventsFunction
  );
  if (!variableParameterNames.size) return [];

  const issues: Array<Object> = [];
  collectEventReferences(eventsFunction.getEvents()).forEach(eventReference => {
    collectEventInstructionReferences(eventReference.event).forEach(
      instructionReference => {
        const instruction = instructionReference.instruction;
        if (
          !DIRECT_VARIABLE_PARAMETER_INSTRUCTION_TYPES.has(
            instruction.getType()
          ) ||
          instruction.getParametersCount() < 1
        ) {
          return;
        }
        const firstParameter = instruction.getParameter(0).getPlainString();
        if (!variableParameterNames.has(firstParameter)) return;

        issues.push({
          severity: 'error',
          type: 'function-variable-parameter-used-as-direct-variable',
          instructionType: instruction.getType(),
          instructionKind: instructionReference.instructionKind,
          eventPath: eventReference.path,
          instructionPath: instructionReference.instructionPath,
          parameterIndex: 0,
          parameterName: firstParameter,
          suggestion: FUNCTION_VARIABLE_PARAMETER_SUGGESTION,
        });
      }
    );
  });
  return issues;
};

const collectRootGroupIssues = (
  eventsFunction: gdEventsFunction
): Array<Object> => {
  const issues: Array<Object> = [];
  const eventsList = eventsFunction.getEvents();
  for (let index = 0; index < eventsList.getEventsCount(); index++) {
    const event = eventsList.getEventAt(index);
    if (event.getType() === 'BuiltinCommonInstructions::Group') continue;
    issues.push({
      severity: 'warning',
      type: 'root-extension-event-not-group',
      eventPath: [index],
      eventType: event.getType(),
      suggestion:
        'Keep extension function root events grouped by responsibility so generated edits and future patches can target stable semantic sections.',
    });
  }
  return issues;
};

const getExtensionFunctionGenerationScope = ({
  extension,
  parentKind,
  parent,
  eventsFunction,
}: ExtensionFunctionTarget): Object => {
  if (parentKind === 'behavior') {
    return {
      eventsFunctionsExtension: extension,
      eventsBasedBehavior: ((parent: any): gdEventsBasedBehavior),
    };
  }
  if (parentKind === 'object') {
    return {
      eventsFunctionsExtension: extension,
      eventsBasedObject: ((parent: any): gdEventsBasedObject),
    };
  }
  return {
    eventsFunctionsExtension: extension,
    eventsFunction,
  };
};

const collectGeneratedCodeIssues = (
  project: gdProject,
  target: ExtensionFunctionTarget
): {| issues: Array<Object>, generatedCode: Object |} => {
  const generatedCode = generateEventsCodeForScope(
    project,
    (getExtensionFunctionGenerationScope(target): any)
  );
  const summary = {
    available: !!generatedCode.code,
    name: generatedCode.name,
    isWholeEntity: !!generatedCode.isWholeEntity,
    bytes:
      typeof generatedCode.code === 'string'
        ? generatedCode.code.length
        : undefined,
    error: generatedCode.error || undefined,
  };
  if (generatedCode.error || !generatedCode.code) {
    return {
      generatedCode: summary,
      issues: [
        {
          severity: 'error',
          type: 'extension-events-code-generation-failed',
          error: generatedCode.error || 'No JavaScript code was generated.',
          suggestion:
            'Fix the extension function events before saving or launching preview; the generated extension JavaScript could not be produced.',
        },
      ],
    };
  }

  try {
    // Parse-only syntax check. References like gdjs are resolved at runtime and
    // are intentionally not executed here.
    // eslint-disable-next-line no-new-func
    new Function(generatedCode.code);
  } catch (error) {
    return {
      generatedCode: summary,
      issues: [
        {
          severity: 'error',
          type: 'extension-events-javascript-syntax-error',
          error: error && error.message ? error.message : String(error),
          suggestion:
            'Fix the extension events that generate invalid JavaScript before writing or launching preview.',
        },
      ],
    };
  }

  return {
    generatedCode: summary,
    issues: [],
  };
};

const summarizeExtensionLintIssues = (issues: Array<Object>): Object => {
  const byType = {};
  issues.forEach(issue => {
    const type = issue.type || 'unknown';
    byType[type] = (byType[type] || 0) + 1;
  });
  return {
    totalIssues: issues.length,
    totalErrors: issues.filter(issue => issue.severity === 'error').length,
    totalWarnings: issues.filter(issue => issue.severity === 'warning').length,
    byType,
  };
};

const lintExtensionFunctionTarget = (
  project: gdProject,
  target: ExtensionFunctionTarget,
  args: Object = {}
): Object => {
  const issues: Array<Object> = [];
  scanProjectForValidationErrors(project)
    .filter(error => isProjectValidationErrorForTarget(error, target))
    .forEach(error => {
      issues.push({
        severity: 'error',
        ...error,
      });
    });

  issues.push(
    ...collectInstructionScopeIssues({
      project,
      parentKind: target.parentKind,
      eventsFunction: target.eventsFunction,
    })
  );
  issues.push(
    ...collectFunctionVariableParameterMisuseIssues(target.eventsFunction)
  );
  if (!args || args.require_root_groups !== false) {
    issues.push(...collectRootGroupIssues(target.eventsFunction));
  }

  const generatedCodeResult: {| generatedCode: Object, issues: Array<Object> |} =
    args && args.include_generated_code === false
      ? { generatedCode: { skipped: true }, issues: [] }
      : collectGeneratedCodeIssues(project, target);
  issues.push(...generatedCodeResult.issues);

  const issueSummary = summarizeExtensionLintIssues(issues);
  const errors = issues.filter(issue => issue.severity === 'error');
  return {
    success: true,
    valid: errors.length === 0,
    extensionName: target.extension.getName(),
    parentKind: target.parentKind,
    parentName: getFunctionParentName(target),
    functionName: target.eventsFunction.getName(),
    issueSummary,
    issues,
    errors,
    generatedCode: generatedCodeResult.generatedCode,
    function: summarizeEventsFunctionCompact(target.eventsFunction),
    variableParameterUsageHint: FUNCTION_VARIABLE_PARAMETER_SUGGESTION,
  };
};

const assertExtensionFunctionEventsAreValid = (
  project: gdProject,
  target: ExtensionFunctionTarget
) => {
  const lintResult = lintExtensionFunctionTarget(project, target, {
    require_root_groups: false,
  });
  if (!lintResult.valid) {
    throw new Error(
      `Invalid extension function events for "${target.extension.getName()}::${target.eventsFunction.getName()}": ${JSON.stringify(
        lintResult.errors
      )}`
    );
  }
};

export const lintExtensionFunctionEvents = (
  project: gdProject,
  args: Object
): Object => {
  return lintExtensionFunctionTarget(
    project,
    getExtensionFunctionTarget(project, args),
    args || {}
  );
};

const pathsEqual = (left: Array<number>, right: Array<number>): boolean =>
  left.length === right.length &&
  left.every((part, index) => part === right[index]);

const eventReferenceMatchesTarget = (
  reference: ExtensionEventReference,
  target: any
): boolean => {
  if (typeof target === 'string') {
    if (target.startsWith('event-')) {
      return pathsEqual(reference.path, parseEventPath(target));
    }
    return reference.event.getAiGeneratedEventId() === target;
  }
  if (!target || typeof target !== 'object') return false;

  let hasCriteria = false;
  const eventPath =
    typeof target.event_path === 'string'
      ? target.event_path
      : typeof target.eventPath === 'string'
      ? target.eventPath
      : null;
  if (eventPath) {
    hasCriteria = true;
    if (!pathsEqual(reference.path, parseEventPath(eventPath))) return false;
  }

  const eventId =
    typeof target.ai_generated_event_id === 'string'
      ? target.ai_generated_event_id
      : typeof target.aiGeneratedEventId === 'string'
      ? target.aiGeneratedEventId
      : typeof target.event_id === 'string'
      ? target.event_id
      : typeof target.eventId === 'string'
      ? target.eventId
      : typeof target.id === 'string'
      ? target.id
      : null;
  if (eventId) {
    hasCriteria = true;
    if (reference.event.getAiGeneratedEventId() !== eventId) return false;
  }

  if (typeof target.event_type === 'string') {
    hasCriteria = true;
    if (reference.event.getType() !== target.event_type) return false;
  }
  if (typeof target.group_name === 'string') {
    hasCriteria = true;
    if (
      reference.event.getType() !== 'BuiltinCommonInstructions::Group' ||
      gd.asGroupEvent(reference.event).getName() !== target.group_name
    ) {
      return false;
    }
  }

  const instructions = getEventInstructions(reference.event);
  if (typeof target.action_type === 'string') {
    hasCriteria = true;
    if (
      !instructions.actions.some(
        instruction => instruction.type === target.action_type
      )
    ) {
      return false;
    }
  }
  if (typeof target.condition_type === 'string') {
    hasCriteria = true;
    if (
      !instructions.conditions.some(
        instruction => instruction.type === target.condition_type
      )
    ) {
      return false;
    }
  }
  if (typeof target.parameter_contains === 'string') {
    hasCriteria = true;
    const needle = target.parameter_contains;
    const hasNeedle = instructions.actions
      .concat(instructions.conditions)
      .some(instruction =>
        instruction.parameters.some(parameter => parameter.includes(needle))
      );
    if (!hasNeedle) return false;
  }
  if (typeof target.text_contains === 'string') {
    hasCriteria = true;
    if (
      JSON.stringify(serializeSingleEventToJSObject(reference.event)).indexOf(
        target.text_contains
      ) === -1
    ) {
      return false;
    }
  }

  return hasCriteria;
};

const getEventTargetFromArgs = (args: Object): any => {
  if (args.event !== undefined) return args.event;
  if (args.event_id !== undefined) return args.event_id;
  if (args.eventId !== undefined) return args.eventId;
  return args;
};

const getSingleExtensionEventReference = (
  eventsList: gdEventsList,
  target: any
): ExtensionEventReference => {
  const references = collectEventReferences(eventsList);
  const matches = references.filter(reference =>
    eventReferenceMatchesTarget(reference, target)
  );
  if (!matches.length && target === undefined && references.length === 1) {
    return references[0];
  }
  if (!matches.length) {
    throw new Error('No extension function event matched the event target.');
  }
  if (matches.length > 1) {
    throw new Error(
      `Ambiguous event target: ${
        matches.length
      } events matched. Use event_id or event_path.`
    );
  }
  return matches[0];
};

const instructionContainsParameter = (
  instruction: gdInstruction,
  expected: string
): boolean => {
  for (let index = 0; index < instruction.getParametersCount(); index++) {
    if (instruction.getParameter(index).getPlainString() === expected) {
      return true;
    }
  }
  return false;
};

export const patchExtensionEventInstruction = (
  project: gdProject,
  args: Object
): Object => {
  const target = getExtensionFunctionTarget(project, args);
  const beforeSerializedExtension = serializeToJSObject(target.extension);
  try {
    const instructionKind =
      typeof args.instruction_kind === 'string'
        ? args.instruction_kind
        : typeof args.instructionKind === 'string'
        ? args.instructionKind
        : 'action';
    const normalizedInstructionKind =
      instructionKind === 'condition' || instructionKind === 'conditions'
        ? 'condition'
        : 'action';
    const instructionType =
      typeof args.instruction_type === 'string'
        ? args.instruction_type
        : typeof args.instructionType === 'string'
        ? args.instructionType
        : null;
    if (!instructionType) {
      throw new Error('Missing instruction_type.');
    }
    const replacementParameters = Array.isArray(args.parameters)
      ? args.parameters.map(parameter => String(parameter))
      : null;
    if (!replacementParameters) {
      throw new Error('Missing parameters array.');
    }

    const eventReference = getSingleExtensionEventReference(
      target.eventsFunction.getEvents(),
      getEventTargetFromArgs(args)
    );
    const objectName =
      typeof args.object_name === 'string'
        ? args.object_name
        : typeof args.objectName === 'string'
        ? args.objectName
        : null;

    const matches = collectEventInstructionReferences(eventReference.event)
      .filter(reference => reference.instructionKind === normalizedInstructionKind)
      .filter(reference => reference.instruction.getType() === instructionType)
      .filter(reference =>
        objectName
          ? instructionContainsParameter(reference.instruction, objectName)
          : true
      );

    if (!matches.length) {
      throw new Error(
        `No ${normalizedInstructionKind} instruction "${instructionType}" matched the event target.`
      );
    }
    if (matches.length > 1) {
      throw new Error(
        `Ambiguous instruction target: ${
          matches.length
        } instructions matched. Add object_name or narrow the event target.`
      );
    }

    const instruction = matches[0].instruction;
    const beforeParameters: Array<string> = [];
    for (let index = 0; index < instruction.getParametersCount(); index++) {
      beforeParameters.push(instruction.getParameter(index).getPlainString());
    }
    instruction.setParametersCount(replacementParameters.length);
    replacementParameters.forEach((parameter, index) => {
      instruction.setParameter(index, parameter);
    });

    assertExtensionFunctionEventsAreValid(project, target);

    const result: Object = {
      success: true,
      extensionName: target.extension.getName(),
      parentKind: target.parentKind,
      parentName: getFunctionParentName(target),
      functionName: target.eventsFunction.getName(),
      eventPath: formatEventPath(eventReference.path),
      aiGeneratedEventId:
        eventReference.event.getAiGeneratedEventId() || null,
      instructionKind: normalizedInstructionKind,
      instructionType,
      instructionPath: matches[0].instructionPath,
      before: {
        type: instruction.getType(),
        parameters: beforeParameters,
      },
      after: {
        type: instruction.getType(),
        parameters: replacementParameters,
      },
      function: summarizeEventsFunctionCompact(target.eventsFunction),
    };

    if (args && args.include_serialized === true) {
      result.serializedFunction = serializeToJSObject(target.eventsFunction);
      result.eventsAsText = renderNonTranslatedEventsAsText({
        eventsList: target.eventsFunction.getEvents(),
      });
    }

    return result;
  } catch (error) {
    unserializeFromJSObject(
      target.extension,
      beforeSerializedExtension,
      'unserializeFrom',
      project
    );
    throw error;
  }
};

const shouldSkipCloneValidation = (args: Object): boolean =>
  !!(args && args.__mcp_skip_clone_validation);

const TEMP_EXTENSION_PREFIX = '__McpValidation_';

const runOnTemporaryExtensionCopy = <T>(
  project: gdProject,
  extensionName: string,
  allowMissingExtension: boolean,
  callback: (string, boolean) => T
): T => {
  const sourceExtensionExists = project.hasEventsFunctionsExtensionNamed(
    extensionName
  );
  if (!sourceExtensionExists && !allowMissingExtension) {
    throw new Error(`Extension not found: "${extensionName}".`);
  }

  const temporaryExtensionName = getSafeUniqueName(
    `${TEMP_EXTENSION_PREFIX}${extensionName}`,
    name => project.hasEventsFunctionsExtensionNamed(name)
  );
  const temporaryExtension = project.insertNewEventsFunctionsExtension(
    temporaryExtensionName,
    project.getEventsFunctionsExtensionsCount()
  );
  try {
    if (sourceExtensionExists) {
      unserializeFromJSObject(
        temporaryExtension,
        serializeToJSObject(project.getEventsFunctionsExtension(extensionName)),
        'unserializeFrom',
        project
      );
      temporaryExtension.setName(temporaryExtensionName);
    }
    return callback(temporaryExtensionName, sourceExtensionExists);
  } finally {
    if (project.hasEventsFunctionsExtensionNamed(temporaryExtensionName)) {
      project.removeEventsFunctionsExtension(temporaryExtensionName);
    }
  }
};

const getOrCreateExtension = (
  project: gdProject,
  extensionName: string
): {| extension: gdEventsFunctionsExtension, created: boolean |} => {
  if (project.hasEventsFunctionsExtensionNamed(extensionName)) {
    return {
      extension: project.getEventsFunctionsExtension(extensionName),
      created: false,
    };
  }
  return {
    extension: project.insertNewEventsFunctionsExtension(
      extensionName,
      project.getEventsFunctionsExtensionsCount()
    ),
    created: true,
  };
};

const getScene = (project: gdProject, sceneName: string): gdLayout => {
  if (!project.hasLayoutNamed(sceneName)) {
    throw new Error(`Scene not found: "${sceneName}".`);
  }
  return project.getLayout(sceneName);
};

const getObjectFromContainers = (
  project: gdProject,
  scene: ?gdLayout,
  objectName: string
): ?gdObject => {
  if (scene && scene.getObjects().hasObjectNamed(objectName)) {
    return scene.getObjects().getObject(objectName);
  }
  if (project.getObjects().hasObjectNamed(objectName)) {
    return project.getObjects().getObject(objectName);
  }
  return null;
};

const iterateInitialInstances = (
  initialInstances: gdInitialInstancesContainer,
  callback: gdInitialInstance => void
) => {
  const instanceGetter = new gd.InitialInstanceJSFunctor();
  // $FlowFixMe[cannot-write]
  instanceGetter.invoke = instancePtr => {
    const instance: gdInitialInstance = gd.wrapPointer(
      // $FlowFixMe[incompatible-type]
      instancePtr,
      gd.InitialInstance
    );
    callback(instance);
  };
  // $FlowFixMe[incompatible-type]
  initialInstances.iterateOverInstances(instanceGetter);
  instanceGetter.delete();
};

const getInitialInstanceSize = (
  instance: gdInitialInstance
): {| width: number, height: number, depth: number |} => {
  const width = instance.hasCustomSize()
    ? instance.getCustomWidth()
    : instance.getDefaultWidth();
  const height = instance.hasCustomSize()
    ? instance.getCustomHeight()
    : instance.getDefaultHeight();
  const depth = instance.hasCustomDepth()
    ? instance.getCustomDepth()
    : instance.getDefaultDepth();
  return {
    width: width && width > 0 ? width : 32,
    height: height && height > 0 ? height : 32,
    depth: depth && depth > 0 ? depth : 0,
  };
};

const computeInstancesAabb = (
  instances: Array<gdInitialInstance>,
  fallbackArea?: ?Object
): {| minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number |} => {
  if (!instances.length) {
    return {
      minX: fallbackArea && typeof fallbackArea.minX === 'number' ? fallbackArea.minX : 0,
      minY: fallbackArea && typeof fallbackArea.minY === 'number' ? fallbackArea.minY : 0,
      minZ: fallbackArea && typeof fallbackArea.minZ === 'number' ? fallbackArea.minZ : 0,
      maxX: fallbackArea && typeof fallbackArea.maxX === 'number' ? fallbackArea.maxX : 64,
      maxY: fallbackArea && typeof fallbackArea.maxY === 'number' ? fallbackArea.maxY : 64,
      maxZ: fallbackArea && typeof fallbackArea.maxZ === 'number' ? fallbackArea.maxZ : 64,
    };
  }
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  instances.forEach(instance => {
    const { width, height, depth } = getInitialInstanceSize(instance);
    minX = Math.min(minX, instance.getX());
    minY = Math.min(minY, instance.getY());
    minZ = Math.min(minZ, instance.getZ());
    maxX = Math.max(maxX, instance.getX() + width);
    maxY = Math.max(maxY, instance.getY() + height);
    maxZ = Math.max(maxZ, instance.getZ() + depth);
  });
  return { minX, minY, minZ, maxX, maxY, maxZ };
};

const setEventsBasedObjectArea = (
  object: gdEventsBasedObject,
  area: Object,
  normalizeOrigin: boolean
) => {
  object.setAreaMinX(0);
  object.setAreaMinY(0);
  object.setAreaMinZ(0);
  object.setAreaMaxX(
    normalizeOrigin ? Math.max(1, area.maxX - area.minX) : area.maxX
  );
  object.setAreaMaxY(
    normalizeOrigin ? Math.max(1, area.maxY - area.minY) : area.maxY
  );
  object.setAreaMaxZ(
    normalizeOrigin ? Math.max(0, area.maxZ - area.minZ) : area.maxZ
  );
};

const copyObjectDefinition = (
  project: gdProject,
  sourceObject: gdObject,
  targetObjects: gdObjectsContainer
) => {
  const objectName = sourceObject.getName();
  if (targetObjects.hasObjectNamed(objectName)) return;
  const targetObject = targetObjects.insertNewObject(
    project,
    sourceObject.getType(),
    objectName,
    targetObjects.getObjectsCount()
  );
  unserializeFromJSObject(
    targetObject,
    serializeToJSObject(sourceObject),
    'unserializeFrom',
    project
  );
  targetObject.resetPersistentUuid();
};

const copyNormalizedInstance = (
  project: gdProject,
  sourceInstance: gdInitialInstance,
  targetInstances: gdInitialInstancesContainer,
  area: Object,
  normalizeOrigin: boolean
) => {
  const instance = new gd.InitialInstance();
  try {
    unserializeFromJSObject(
      instance,
      serializeToJSObject(sourceInstance),
      'unserializeFrom',
      project
    );
    if (normalizeOrigin) {
      instance.setX(instance.getX() - area.minX);
      instance.setY(instance.getY() - area.minY);
      instance.setZ(instance.getZ() - area.minZ);
    }
    instance.setLayer('');
    targetInstances.insertInitialInstance(instance).resetPersistentUuid();
  } finally {
    instance.delete();
  }
};

const removeInstances = (
  initialInstances: gdInitialInstancesContainer,
  instances: Array<gdInitialInstance>
) => {
  instances.forEach(instance => initialInstances.removeInstance(instance));
};

const removeUnusedObjects = (
  objects: gdObjectsContainer,
  initialInstances: gdInitialInstancesContainer,
  objectNames: Array<string>
) => {
  objectNames.forEach(objectName => {
    if (
      objects.hasObjectNamed(objectName) &&
      !initialInstances.hasInstancesOfObject(objectName)
    ) {
      objects.removeObject(objectName);
    }
  });
};

const createTargetEventsBasedObject = (
  extension: gdEventsFunctionsExtension,
  objectName: string,
  replaceExisting: boolean
): {| object: gdEventsBasedObject, replacedExisting: boolean |} => {
  const objects = extension.getEventsBasedObjects();
  const replacedExisting = objects.has(objectName);
  if (replacedExisting && !replaceExisting) {
    throw new Error(
      `Events-based object "${objectName}" already exists in extension "${extension.getName()}". Pass replace_existing:true to overwrite it.`
    );
  }
  if (replacedExisting) {
    objects.remove(objectName);
  }
  return {
    object: objects.insertNew(objectName, objects.getCount()),
    replacedExisting,
  };
};

const getObjectNamesArg = (
  args: Object,
  names: Array<string>,
  requiredLabel: string
): Array<string> => {
  for (const name of names) {
    if (Array.isArray(args[name])) {
      const values = args[name]
        .filter(value => typeof value === 'string' && value.trim())
        .map(value => normalizeRequiredName(value, `${name} item`));
      if (values.length) return Array.from(new Set(values));
    }
    if (typeof args[name] === 'string' && args[name].trim()) {
      return [normalizeRequiredName(args[name], name)];
    }
  }
  throw new Error(`Missing ${requiredLabel}.`);
};

const extractPrefabFromSceneInstances = ({
  project,
  args,
  targetObject,
}: {|
  project: gdProject,
  args: Object,
  targetObject: gdEventsBasedObject,
|}): Object => {
  const sceneName = normalizeRequiredName(args.scene_name, 'scene_name');
  const scene = getScene(project, sceneName);
  const sourceObjectNames = getObjectNamesArg(
    args,
    ['source_object_names', 'source_objects', 'child_object_names'],
    'source_object_names'
  );
  const sourceObjectNameSet = new Set(sourceObjectNames);
  const selectedInstances = [];
  iterateInitialInstances(scene.getInitialInstances(), instance => {
    if (sourceObjectNameSet.has(instance.getObjectName())) {
      selectedInstances.push(instance);
    }
  });
  if (!selectedInstances.length) {
    throw new Error(
      `No initial instances found in scene "${sceneName}" for: ${sourceObjectNames.join(
        ', '
      )}.`
    );
  }

  const area = computeInstancesAabb(selectedInstances);
  const normalizeOrigin = !(args && args.normalize_origin === false);
  setEventsBasedObjectArea(targetObject, area, normalizeOrigin);
  const childObjects = targetObject.getObjects();
  sourceObjectNames.forEach(objectName => {
    const sourceObject = getObjectFromContainers(project, scene, objectName);
    if (!sourceObject) {
      throw new Error(`Object not found in scene/global scope: "${objectName}".`);
    }
    copyObjectDefinition(project, sourceObject, childObjects);
  });
  selectedInstances.forEach(instance =>
    copyNormalizedInstance(
      project,
      instance,
      targetObject.getInitialInstances(),
      area,
      normalizeOrigin
    )
  );

  const migrationWarnings = [];
  if (args && args.replace_in_scene_with_prefab_instance) {
    const prefabObjectName = getSafeUniqueName(
      args.prefab_scene_object_name || targetObject.getDefaultName() || targetObject.getName(),
      name =>
        scene.getObjects().hasObjectNamed(name) ||
        project.getObjects().hasObjectNamed(name)
    );
    const prefabType = gd.PlatformExtension.getObjectFullType(
      normalizeRequiredName(args.extension_name, 'extension_name'),
      targetObject.getName()
    );
    scene
      .getObjects()
      .insertNewObject(project, prefabType, prefabObjectName, 0);
    const prefabInstance = scene.getInitialInstances().insertNewInitialInstance();
    prefabInstance.setObjectName(prefabObjectName);
    prefabInstance.setX(area.minX);
    prefabInstance.setY(area.minY);
    prefabInstance.setZ(area.minZ);
    prefabInstance.setLayer(selectedInstances[0].getLayer());
    prefabInstance.setZOrder(
      Math.max(...selectedInstances.map(instance => instance.getZOrder()))
    );
    removeInstances(scene.getInitialInstances(), selectedInstances);
    if (args.remove_scene_objects_when_unused) {
      removeUnusedObjects(
        scene.getObjects(),
        scene.getInitialInstances(),
        sourceObjectNames
      );
    }
    migrationWarnings.push(
      'Scene events that directly reference the extracted child object names were not rewritten. Use find_project_events/find_scene_events to migrate those references manually.'
    );
  }

  return {
    sourceKind: 'scene_instances',
    sceneName,
    sourceObjectNames,
    extractedInstancesCount: selectedInstances.length,
    migrationWarnings,
  };
};

const extractPrefabFromExtensionObject = ({
  project,
  args,
  targetObject,
}: {|
  project: gdProject,
  args: Object,
  targetObject: gdEventsBasedObject,
|}): Object => {
  const sourceExtensionName = normalizeRequiredName(
    args.source_extension_name || args.extension_name,
    'source_extension_name'
  );
  const sourceObjectName = normalizeRequiredName(
    args.source_object_name,
    'source_object_name'
  );
  const sourceExtension = getExtension(project, sourceExtensionName);
  const sourceObjects = sourceExtension.getEventsBasedObjects();
  if (!sourceObjects.has(sourceObjectName)) {
    throw new Error(`Source events-based object not found: "${sourceObjectName}".`);
  }
  const sourceObject = sourceObjects.get(sourceObjectName);
  let childObjectNames;
  if (args.child_object_names || args.source_child_object_names) {
    childObjectNames = getObjectNamesArg(
      args,
      ['child_object_names', 'source_child_object_names'],
      'child_object_names'
    );
  } else {
    childObjectNames = mapFor(0, sourceObject.getObjects().getObjectsCount(), index =>
      sourceObject.getObjects().getObjectAt(index).getName()
    );
  }
  if (!childObjectNames.length) {
    throw new Error(
      `Source events-based object "${sourceObjectName}" has no child objects to extract.`
    );
  }
  const childObjectNameSet = new Set(childObjectNames);
  const selectedInstances = [];
  iterateInitialInstances(sourceObject.getInitialInstances(), instance => {
    if (childObjectNameSet.has(instance.getObjectName())) {
      selectedInstances.push(instance);
    }
  });

  const area = computeInstancesAabb(selectedInstances, {
    minX: sourceObject.getAreaMinX(),
    minY: sourceObject.getAreaMinY(),
    minZ: sourceObject.getAreaMinZ(),
    maxX: sourceObject.getAreaMaxX(),
    maxY: sourceObject.getAreaMaxY(),
    maxZ: sourceObject.getAreaMaxZ(),
  });
  const normalizeOrigin = !(args && args.normalize_origin === false);
  setEventsBasedObjectArea(targetObject, area, normalizeOrigin);
  const targetChildObjects = targetObject.getObjects();
  childObjectNames.forEach(objectName => {
    const sourceChildObjects = sourceObject.getObjects();
    if (!sourceChildObjects.hasObjectNamed(objectName)) {
      throw new Error(
        `Child object "${objectName}" not found in "${sourceObjectName}".`
      );
    }
    copyObjectDefinition(
      project,
      sourceChildObjects.getObject(objectName),
      targetChildObjects
    );
  });
  selectedInstances.forEach(instance =>
    copyNormalizedInstance(
      project,
      instance,
      targetObject.getInitialInstances(),
      area,
      normalizeOrigin
    )
  );

  const migrationWarnings = [];
  if (args && args.replace_in_source_with_prefab_instance) {
    const prefabChildObjectName = getSafeUniqueName(
      args.prefab_child_object_name || targetObject.getDefaultName() || targetObject.getName(),
      name => sourceObject.getObjects().hasObjectNamed(name)
    );
    const prefabType = gd.PlatformExtension.getObjectFullType(
      normalizeRequiredName(args.extension_name, 'extension_name'),
      targetObject.getName()
    );
    sourceObject
      .getObjects()
      .insertNewObject(project, prefabType, prefabChildObjectName, 0);
    const prefabInstance = sourceObject
      .getInitialInstances()
      .insertNewInitialInstance();
    prefabInstance.setObjectName(prefabChildObjectName);
    prefabInstance.setX(area.minX);
    prefabInstance.setY(area.minY);
    prefabInstance.setZ(area.minZ);
    prefabInstance.setZOrder(
      selectedInstances.length
        ? Math.max(...selectedInstances.map(instance => instance.getZOrder()))
        : 0
    );
    removeInstances(sourceObject.getInitialInstances(), selectedInstances);
    if (args.remove_extracted_children) {
      removeUnusedObjects(
        sourceObject.getObjects(),
        sourceObject.getInitialInstances(),
        childObjectNames
      );
    }
    migrationWarnings.push(
      'Extension events that directly reference the extracted child object names were not rewritten. Use find_extension_events/find_project_events to migrate those references manually.'
    );
  }

  return {
    sourceKind: 'extension_object',
    sourceExtensionName,
    sourceObjectName,
    childObjectNames,
    extractedInstancesCount: selectedInstances.length,
    migrationWarnings,
  };
};

export const extractPrefabFromObject = (
  project: gdProject,
  args: Object
): Object => {
  const extensionName = normalizeRequiredName(
    args.extension_name,
    'extension_name'
  );
  const getValidationArgs = (temporaryExtensionName: string): Object => {
    const sourceKind =
      args && typeof args.source_kind === 'string'
        ? args.source_kind
        : args && args.scene_name
        ? 'scene_instances'
        : 'extension_object';
    const validationArgs = {
      ...args,
      extension_name: temporaryExtensionName,
      dry_run: false,
      __mcp_skip_clone_validation: true,
      replace_in_scene_with_prefab_instance: false,
      replace_in_source_with_prefab_instance: false,
      remove_scene_objects_when_unused: false,
      remove_extracted_children: false,
    };
    if (
      sourceKind === 'extension_object' &&
      (!args.source_extension_name || args.source_extension_name === extensionName)
    ) {
      validationArgs.source_extension_name = temporaryExtensionName;
    }
    return validationArgs;
  };

  const dryRun = !!(args && args.dry_run);
  if (dryRun) {
    return runOnTemporaryExtensionCopy(
      project,
      extensionName,
      true,
      (temporaryExtensionName, sourceExtensionExists) => {
        const result = extractPrefabFromObject(
          project,
          getValidationArgs(temporaryExtensionName)
        );
        const migrationWarnings = [...((result.migrationWarnings: any) || [])];
        if (
          args.replace_in_scene_with_prefab_instance ||
          args.replace_in_source_with_prefab_instance
        ) {
          migrationWarnings.push(
            'Dry-run validates extraction and target prefab creation, but does not mutate source scene/extension containers. Re-run without dry_run to apply requested replacement flags.'
          );
        }
        return {
          ...result,
          dryRun: true,
          extensionName,
          createdExtension: !sourceExtensionExists,
          prefabType: gd.PlatformExtension.getObjectFullType(
            extensionName,
            result.objectName
          ),
          migrationWarnings,
          dryRunNote:
            'Validated on a temporary extension copy; the live project was not mutated.',
        };
      }
    );
  }

  if (!shouldSkipCloneValidation(args)) {
    runOnTemporaryExtensionCopy(
      project,
      extensionName,
      true,
      temporaryExtensionName =>
        extractPrefabFromObject(project, getValidationArgs(temporaryExtensionName))
    );
  }

  const objectName = normalizeRequiredName(args.object_name, 'object_name');
  const { extension, created: createdExtension } = getOrCreateExtension(
    project,
    extensionName
  );
  const { object, replacedExisting } = createTargetEventsBasedObject(
    extension,
    objectName,
    !!(args && args.replace_existing)
  );
  applyObjectFields(object, args);
  if (!object.getDefaultName()) object.setDefaultName(objectName);

  const sourceKind =
    args && typeof args.source_kind === 'string'
      ? args.source_kind
      : args && args.scene_name
      ? 'scene_instances'
      : 'extension_object';
  let sourceResult;
  if (sourceKind === 'scene_instances') {
    sourceResult = extractPrefabFromSceneInstances({
      project,
      args,
      targetObject: object,
    });
  } else if (sourceKind === 'extension_object') {
    sourceResult = extractPrefabFromExtensionObject({
      project,
      args,
      targetObject: object,
    });
  } else if (sourceKind === 'scene_object') {
    const sceneName = normalizeRequiredName(args.scene_name, 'scene_name');
    const sourceObjectName = normalizeRequiredName(
      args.source_object_name,
      'source_object_name'
    );
    const sourceScene = getScene(project, sceneName);
    const sourceObject = getObjectFromContainers(
      project,
      sourceScene,
      sourceObjectName
    );
    if (!sourceObject) {
      throw new Error(`Scene/global object not found: "${sourceObjectName}".`);
    }
    if (!project.hasEventsBasedObject(sourceObject.getType())) {
      throw new Error(
        `Scene/global object "${sourceObjectName}" has type "${sourceObject.getType()}", which is not an events-based object type. Use source_kind:"scene_instances" with source_object_names to extract ordinary scene objects.`
      );
    }
    const sourceExtensionName = gd.PlatformExtension.getExtensionFromFullObjectType(
      sourceObject.getType()
    );
    const eventsBasedObjectName = gd.PlatformExtension.getObjectNameFromFullObjectType(
      sourceObject.getType()
    );
    sourceResult = extractPrefabFromExtensionObject({
      project,
      args: {
        ...args,
        source_extension_name: sourceExtensionName,
        source_object_name: eventsBasedObjectName,
        child_object_names:
          args.child_object_names || args.source_child_object_names,
      },
      targetObject: object,
    });
    sourceResult.sourceKind = 'scene_object';
    sourceResult.sceneName = sceneName;
    sourceResult.sourceObjectName = sourceObjectName;
  } else {
    throw new Error(
      'source_kind must be scene_instances, scene_object, or extension_object.'
    );
  }

  return {
    success: true,
    dryRun: false,
    extensionName,
    objectName,
    createdExtension,
    replacedExisting,
    prefabType: gd.PlatformExtension.getObjectFullType(extensionName, objectName),
    ...sourceResult,
    object: summarizeObject(
      object,
      !(args && args.summary_only),
      !(args && args.summary_only)
    ),
  };
};

const getPropertiesContainer = (
  project: gdProject,
  args: Object
): {|
  extension: gdEventsFunctionsExtension,
  targetKind: string,
  target: gdEventsBasedBehavior | gdEventsBasedObject,
  properties: gdPropertiesContainer,
|} => {
  const extensionName = normalizeRequiredName(
    args.extension_name,
    'extension_name'
  );
  const extension = getExtension(project, extensionName);
  const targetKind = normalizeTargetKind(args.target_kind);
  const targetName = normalizeRequiredName(args.target_name, 'target_name');
  const isShared = !!args.is_shared;

  if (targetKind === 'behavior') {
    const behaviors = extension.getEventsBasedBehaviors();
    if (!behaviors.has(targetName)) {
      throw new Error(`Events-based behavior not found: "${targetName}".`);
    }
    const behavior = behaviors.get(targetName);
    return {
      extension,
      targetKind,
      target: behavior,
      properties: isShared
        ? behavior.getSharedPropertyDescriptors()
        : behavior.getPropertyDescriptors(),
    };
  }

  if (isShared) {
    throw new Error('Events-based object properties do not support is_shared.');
  }
  const objects = extension.getEventsBasedObjects();
  if (!objects.has(targetName)) {
    throw new Error(`Events-based object not found: "${targetName}".`);
  }
  const object = objects.get(targetName);
  return {
    extension,
    targetKind,
    target: object,
    properties: object.getPropertyDescriptors(),
  };
};

export const inspectExtensionProperty = (
  project: gdProject,
  args: Object
): Object => {
  const { properties, targetKind } = getPropertiesContainer(project, args);
  const propertyName = normalizeRequiredName(
    args.property_name,
    'property_name'
  );
  if (!properties.has(propertyName)) {
    throw new Error(`Property not found: "${propertyName}".`);
  }
  return {
    targetKind,
    property: summarizeProperty(
      properties.get(propertyName),
      properties.getPosition(properties.get(propertyName))
    ),
  };
};

const applyExtensionFields = (
  extension: gdEventsFunctionsExtension,
  args: Object
) => {
  setStringIfProvided(extension, 'setNamespace', args, 'namespace');
  setStringIfProvided(extension, 'setFullName', args, 'full_name');
  setStringIfProvided(
    extension,
    'setShortDescription',
    args,
    'short_description'
  );
  setStringIfProvided(extension, 'setDescription', args, 'description');
  setStringIfProvided(extension, 'setVersion', args, 'version');
  setStringIfProvided(extension, 'setCategory', args, 'category');
  setStringIfProvided(extension, 'setDimension', args, 'dimension');
  setStringIfProvided(extension, 'setHelpPath', args, 'help_path');
  setStringIfProvided(extension, 'setIconUrl', args, 'icon_url');
  setStringIfProvided(extension, 'setPreviewIconUrl', args, 'preview_icon_url');
  if (Array.isArray(args.tags)) {
    replaceVectorString(
      extension.getTags(),
      args.tags.filter(tag => typeof tag === 'string')
    );
  }
};

export const createOrUpdateExtension = (
  project: gdProject,
  args: Object
): Object => {
  const extensionName = normalizeRequiredName(
    args.extension_name,
    'extension_name'
  );
  const created = !project.hasEventsFunctionsExtensionNamed(extensionName);
  let extension = created
    ? project.insertNewEventsFunctionsExtension(
        extensionName,
        project.getEventsFunctionsExtensionsCount()
      )
    : project.getEventsFunctionsExtension(extensionName);

  if (
    args.serialized_extension &&
    typeof args.serialized_extension === 'object'
  ) {
    unserializeFromJSObject(
      extension,
      args.serialized_extension,
      'unserializeFrom',
      project
    );
    extension.setName(extensionName);
  }

  const newExtensionName = normalizeOptionalName(
    args.new_extension_name,
    'new_extension_name'
  );
  if (newExtensionName && newExtensionName !== extension.getName()) {
    const safeAndUniqueName = getSafeUniqueName(
      newExtensionName,
      name => project.hasEventsFunctionsExtensionNamed(name),
      extension.getName()
    );
    gd.WholeProjectRefactorer.renameEventsFunctionsExtension(
      project,
      extension,
      extension.getName(),
      safeAndUniqueName
    );
    extension.setName(safeAndUniqueName);
    extension = project.getEventsFunctionsExtension(safeAndUniqueName);
  }

  applyExtensionFields(extension, args);

  return {
    success: true,
    created,
    extension: summarizeExtension(extension),
  };
};

export const deleteExtension = (project: gdProject, args: Object): Object => {
  const extensionName = normalizeRequiredName(
    args.extension_name,
    'extension_name'
  );
  if (!project.hasEventsFunctionsExtensionNamed(extensionName)) {
    throw new Error(`Extension not found: "${extensionName}".`);
  }
  project.removeEventsFunctionsExtension(extensionName);
  return {
    success: true,
    deletedExtensionName: extensionName,
  };
};

const renameEventsFunction = ({
  project,
  extension,
  parentKind,
  parent,
  eventsFunction,
  newName,
}: {|
  project: gdProject,
  extension: gdEventsFunctionsExtension,
  parentKind: string,
  parent:
    | gdEventsFunctionsExtension
    | gdEventsBasedBehavior
    | gdEventsBasedObject,
  eventsFunction: gdEventsFunction,
  newName: string,
|}) => {
  if (newName === eventsFunction.getName()) return;
  if (parentKind === 'extension') {
    gd.WholeProjectRefactorer.renameEventsFunction(
      project,
      extension,
      eventsFunction.getName(),
      newName
    );
  } else if (parentKind === 'behavior') {
    gd.WholeProjectRefactorer.renameBehaviorEventsFunction(
      project,
      extension,
      ((parent: any): gdEventsBasedBehavior),
      eventsFunction.getName(),
      newName
    );
  } else {
    gd.WholeProjectRefactorer.renameObjectEventsFunction(
      project,
      extension,
      ((parent: any): gdEventsBasedObject),
      eventsFunction.getName(),
      newName
    );
  }
  eventsFunction.setName(newName);
};

const applyParameterFields = (
  parameter: gdParameterMetadata,
  parameterArgs: Object
) => {
  if (typeof parameterArgs.type === 'string') {
    parameter.setType(
      parameterArgs.type === 'number' ? 'expression' : parameterArgs.type
    );
  }
  setStringIfProvided(
    parameter,
    'setDescription',
    parameterArgs,
    'description'
  );
  setStringIfProvided(
    parameter,
    'setLongDescription',
    parameterArgs,
    'long_description'
  );
  if (
    parameterArgs.value_type &&
    typeof parameterArgs.value_type === 'object'
  ) {
    applyValueTypeMetadata(
      parameter.getValueTypeMetadata(),
      parameterArgs.value_type
    );
  }
};

const upsertFunctionParameters = (
  eventsFunction: gdEventsFunction,
  parametersArgs: Array<any>
) => {
  const parameters = eventsFunction.getParameters();
  parametersArgs.forEach(parameterArgs => {
    if (!parameterArgs || typeof parameterArgs !== 'object') return;
    const parameterName = normalizeRequiredName(
      parameterArgs.name,
      'parameter.name'
    );
    let parameter;
    if (parameters.hasParameterNamed(parameterName)) {
      parameter = parameters.getParameter(parameterName);
    } else {
      parameter = parameters.insertNewParameter(
        parameterName,
        parameters.getParametersCount()
      );
    }
    applyParameterFields(parameter, parameterArgs);
  });
};

const parseValidatedEventsJson = (
  project: gdProject,
  eventsJson: any
): ?Array<Object> => {
  if (eventsJson === undefined || eventsJson === null) return null;

  let parsedEvents;
  if (typeof eventsJson === 'string') {
    try {
      parsedEvents = JSON.parse(eventsJson);
    } catch (error) {
      throw new Error(`Invalid events_json: ${error.message}`);
    }
  } else {
    parsedEvents = JSON.parse(JSON.stringify(eventsJson));
  }
  if (
    parsedEvents &&
    !Array.isArray(parsedEvents) &&
    typeof parsedEvents.type === 'string'
  ) {
    parsedEvents = [parsedEvents];
  } else if (
    parsedEvents &&
    !Array.isArray(parsedEvents) &&
    Array.isArray(parsedEvents.events)
  ) {
    parsedEvents = parsedEvents.events;
  }
  if (!Array.isArray(parsedEvents)) {
    throw new Error(
      'Invalid events_json: expected an events array, a single serialized event object, or { events: [...] }.'
    );
  }

  const validationEventsList = new gd.EventsList();
  try {
    unserializeFromJSObject(
      validationEventsList,
      parsedEvents,
      'unserializeFrom',
      project
    );
    return serializeToJSObject(validationEventsList);
  } finally {
    validationEventsList.delete();
  }
};

const getEventsJsonInput = (args: Object): any =>
  hasOwn(args, 'events_json')
    ? args.events_json
    : hasOwn(args, 'eventsJson')
    ? args.eventsJson
    : hasOwn(args, 'events')
    ? args.events
    : undefined;

const applyEventsFunctionFields = (
  project: gdProject,
  eventsFunction: gdEventsFunction,
  args: Object,
  parsedEventsJson?: ?Array<Object>
) => {
  const functionType = normalizeFunctionType(args.function_type);
  if (functionType != null) {
    eventsFunction.setFunctionType(functionType);
  }
  setStringIfProvided(eventsFunction, 'setFullName', args, 'full_name');
  setStringIfProvided(eventsFunction, 'setDescription', args, 'description');
  if (hasOwn(args, 'sentence') && typeof args.sentence === 'string') {
    eventsFunction.setSentence(args.sentence.replace(/\n/g, ''));
  }
  setStringIfProvided(eventsFunction, 'setHelpUrl', args, 'help_url');
  setBooleanIfProvided(eventsFunction, 'setPrivate', args, 'is_private');
  setBooleanIfProvided(eventsFunction, 'setAsync', args, 'is_async');
  setBooleanIfProvided(eventsFunction, 'setDeprecated', args, 'is_deprecated');
  setStringIfProvided(
    eventsFunction,
    'setDeprecationMessage',
    args,
    'deprecation_message'
  );
  if (args.expression_type && typeof args.expression_type === 'object') {
    applyValueTypeMetadata(
      eventsFunction.getExpressionType(),
      args.expression_type
    );
  }
  if (Array.isArray(args.parameters)) {
    upsertFunctionParameters(eventsFunction, args.parameters);
  }
  if (getEventsJsonInput(args) !== undefined) {
    const parsedEvents =
      parsedEventsJson || parseValidatedEventsJson(project, getEventsJsonInput(args));
    eventsFunction.getEvents().clear();
    unserializeFromJSObject(
      eventsFunction.getEvents(),
      parsedEvents,
      'unserializeFrom',
      project
    );
  }
};

export const createOrUpdateExtensionFunction = (
  project: gdProject,
  args: Object
): Object => {
  const extensionNameForValidation = normalizeRequiredName(
    args.extension_name,
    'extension_name'
  );
  if (args && args.dry_run) {
    return runOnTemporaryExtensionCopy(
      project,
      extensionNameForValidation,
      false,
      temporaryExtensionName => {
        const result = createOrUpdateExtensionFunction(project, {
          ...args,
          extension_name: temporaryExtensionName,
          dry_run: false,
          __mcp_skip_clone_validation: true,
        });
        return {
          ...result,
          dryRun: true,
          dryRunNote:
            'Validated on a temporary extension copy; the live extension was not mutated.',
        };
      }
    );
  }

  if (!shouldSkipCloneValidation(args)) {
    runOnTemporaryExtensionCopy(
      project,
      extensionNameForValidation,
      false,
      temporaryExtensionName =>
        createOrUpdateExtensionFunction(project, {
          ...args,
          extension_name: temporaryExtensionName,
          __mcp_skip_clone_validation: true,
        })
    );
  }

  const parsedEventsJson = parseValidatedEventsJson(
    project,
    getEventsJsonInput(args)
  );
  const { extension, parentKind, parent, container } = getFunctionParent(
    project,
    args
  );
  const beforeSerializedExtension = serializeToJSObject(extension);
  const functionName = normalizeRequiredName(
    args.function_name,
    'function_name'
  );

  try {
    const created = !container.hasEventsFunctionNamed(functionName);
    let eventsFunction = created
      ? container.insertNewEventsFunction(
          functionName,
          container.getEventsFunctionsCount()
        )
      : container.getEventsFunction(functionName);

    if (
      args.serialized_function &&
      typeof args.serialized_function === 'object'
    ) {
      unserializeFromJSObject(
        eventsFunction,
        args.serialized_function,
        'unserializeFrom',
        project
      );
      eventsFunction.setName(functionName);
    }

    const newFunctionName = normalizeOptionalName(
      args.new_function_name,
      'new_function_name'
    );
    if (newFunctionName && newFunctionName !== eventsFunction.getName()) {
      const safeAndUniqueName = getSafeUniqueName(
        newFunctionName,
        name => container.hasEventsFunctionNamed(name),
        eventsFunction.getName()
      );
      renameEventsFunction({
        project,
        extension,
        parentKind,
        parent,
        eventsFunction,
        newName: safeAndUniqueName,
      });
      eventsFunction = container.getEventsFunction(safeAndUniqueName);
    }

    const functionType = normalizeFunctionType(args.function_type);
    if (functionType != null) {
      eventsFunction.setFunctionType(functionType);
    }
    if (parentKind === 'behavior') {
      gd.WholeProjectRefactorer.ensureBehaviorEventsFunctionsProperParameters(
        extension,
        ((parent: any): gdEventsBasedBehavior)
      );
    } else if (parentKind === 'object') {
      gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
        extension,
        ((parent: any): gdEventsBasedObject)
      );
    }

    applyEventsFunctionFields(project, eventsFunction, args, parsedEventsJson);
    assertEventsFunctionSentenceIsValid(parentKind, eventsFunction);
    if (
      created &&
      eventsFunction.isCondition() &&
      !eventsFunction.isExpression()
    ) {
      gd.PropertyFunctionGenerator.generateConditionSkeleton(
        project,
        eventsFunction
      );
    }
    assertExtensionFunctionEventsAreValid(project, {
      extension,
      parentKind,
      parent,
      eventsFunction,
    });

    const summaryOnly = !!(args && args.summary_only);
    return {
      success: true,
      dryRun: false,
      created,
      wouldCreate: created,
      parentKind,
      function: summarizeEventsFunction(
        eventsFunction,
        !summaryOnly,
        !summaryOnly
      ),
    };
  } catch (error) {
    unserializeFromJSObject(
      extension,
      beforeSerializedExtension,
      'unserializeFrom',
      project
    );
    throw error;
  }
};

export const deleteExtensionFunction = (
  project: gdProject,
  args: Object
): Object => {
  const { parentKind, container } = getFunctionParent(project, args);
  const functionName = normalizeRequiredName(
    args.function_name,
    'function_name'
  );
  if (!container.hasEventsFunctionNamed(functionName)) {
    throw new Error(`Events function not found: "${functionName}".`);
  }
  container.removeEventsFunction(functionName);
  return {
    success: true,
    parentKind,
    deletedFunctionName: functionName,
  };
};

const applyBehaviorFields = (behavior: gdEventsBasedBehavior, args: Object) => {
  setStringIfProvided(behavior, 'setFullName', args, 'full_name');
  setStringIfProvided(behavior, 'setDescription', args, 'description');
  setStringIfProvided(behavior, 'setObjectType', args, 'object_type');
  setBooleanIfProvided(behavior, 'setPrivate', args, 'is_private');
  setStringIfProvided(behavior, 'setIconUrl', args, 'icon_url');
  setStringIfProvided(behavior, 'setPreviewIconUrl', args, 'preview_icon_url');
};

export const createOrUpdateExtensionBehavior = (
  project: gdProject,
  args: Object
): Object => {
  const extensionName = normalizeRequiredName(
    args.extension_name,
    'extension_name'
  );
  const extension = getExtension(project, extensionName);
  const behaviorName = normalizeRequiredName(
    args.behavior_name,
    'behavior_name'
  );
  const behaviors = extension.getEventsBasedBehaviors();
  const created = !behaviors.has(behaviorName);
  let behavior = created
    ? behaviors.insertNew(behaviorName, behaviors.getCount())
    : behaviors.get(behaviorName);

  if (
    args.serialized_behavior &&
    typeof args.serialized_behavior === 'object'
  ) {
    unserializeFromJSObject(
      behavior,
      args.serialized_behavior,
      'unserializeFrom',
      project
    );
    behavior.setName(behaviorName);
  }

  const newBehaviorName = normalizeOptionalName(
    args.new_behavior_name,
    'new_behavior_name'
  );
  if (newBehaviorName && newBehaviorName !== behavior.getName()) {
    const safeAndUniqueName = getSafeUniqueName(
      newBehaviorName,
      name => behaviors.has(name),
      behavior.getName()
    );
    gd.WholeProjectRefactorer.renameEventsBasedBehavior(
      project,
      extension,
      behavior.getName(),
      safeAndUniqueName
    );
    behavior.setName(safeAndUniqueName);
    behavior = behaviors.get(safeAndUniqueName);
  }

  applyBehaviorFields(behavior, args);

  return {
    success: true,
    created,
    behavior: summarizeBehavior(behavior, true),
  };
};

export const deleteExtensionBehavior = (
  project: gdProject,
  args: Object
): Object => {
  const extensionName = normalizeRequiredName(
    args.extension_name,
    'extension_name'
  );
  const behaviorName = normalizeRequiredName(
    args.behavior_name,
    'behavior_name'
  );
  const behaviors = getExtension(
    project,
    extensionName
  ).getEventsBasedBehaviors();
  if (!behaviors.has(behaviorName)) {
    throw new Error(`Events-based behavior not found: "${behaviorName}".`);
  }
  behaviors.remove(behaviorName);
  return {
    success: true,
    deletedBehaviorName: behaviorName,
  };
};

const applyObjectArea = (object: gdEventsBasedObject, args: Object) => {
  if (!args.area || typeof args.area !== 'object') return;
  setNumberIfProvided(object, 'setAreaMinX', args.area, 'min_x');
  setNumberIfProvided(object, 'setAreaMinY', args.area, 'min_y');
  setNumberIfProvided(object, 'setAreaMinZ', args.area, 'min_z');
  setNumberIfProvided(object, 'setAreaMaxX', args.area, 'max_x');
  setNumberIfProvided(object, 'setAreaMaxY', args.area, 'max_y');
  setNumberIfProvided(object, 'setAreaMaxZ', args.area, 'max_z');
};

const applyObjectFields = (object: gdEventsBasedObject, args: Object) => {
  setStringIfProvided(object, 'setFullName', args, 'full_name');
  setStringIfProvided(object, 'setDescription', args, 'description');
  setStringIfProvided(object, 'setDefaultName', args, 'default_name');
  setBooleanIfProvided(object, 'markAsRenderedIn3D', args, 'is_rendered_in_3d');
  setBooleanIfProvided(object, 'setPrivate', args, 'is_private');
  setBooleanIfProvided(
    object,
    'markAsInnerAreaFollowingParentSize',
    args,
    'is_inner_area_following_parent_size'
  );
  setBooleanIfProvided(
    object,
    'markAsTextContainer',
    args,
    'is_text_container'
  );
  setBooleanIfProvided(object, 'markAsAnimatable', args, 'is_animatable');
  setStringIfProvided(object, 'setIconUrl', args, 'icon_url');
  setStringIfProvided(object, 'setPreviewIconUrl', args, 'preview_icon_url');
  applyObjectArea(object, args);
};

export const createOrUpdateExtensionObject = (
  project: gdProject,
  args: Object
): Object => {
  const extensionName = normalizeRequiredName(
    args.extension_name,
    'extension_name'
  );
  if (args && args.dry_run) {
    return runOnTemporaryExtensionCopy(
      project,
      extensionName,
      false,
      temporaryExtensionName => {
        const result = createOrUpdateExtensionObject(project, {
          ...args,
          extension_name: temporaryExtensionName,
          dry_run: false,
          __mcp_skip_clone_validation: true,
        });
        return {
          ...result,
          dryRun: true,
          dryRunNote:
            'Validated on a temporary extension copy; the live extension was not mutated.',
        };
      }
    );
  }

  if (!shouldSkipCloneValidation(args)) {
    runOnTemporaryExtensionCopy(
      project,
      extensionName,
      false,
      temporaryExtensionName =>
        createOrUpdateExtensionObject(project, {
          ...args,
          extension_name: temporaryExtensionName,
          __mcp_skip_clone_validation: true,
        })
    );
  }

  const extension = getExtension(project, extensionName);
  const objectName = normalizeRequiredName(args.object_name, 'object_name');
  const objects = extension.getEventsBasedObjects();

  const created = !objects.has(objectName);
  let object = created
    ? objects.insertNew(objectName, objects.getCount())
    : objects.get(objectName);

  if (args.serialized_object && typeof args.serialized_object === 'object') {
    unserializeFromJSObject(
      object,
      args.serialized_object,
      'unserializeFrom',
      project
    );
    object.setName(objectName);
  }

  const newObjectName = normalizeOptionalName(
    args.new_object_name,
    'new_object_name'
  );
  if (newObjectName && newObjectName !== object.getName()) {
    const safeAndUniqueName = getSafeUniqueName(
      newObjectName,
      name => objects.has(name),
      object.getName()
    );
    gd.WholeProjectRefactorer.renameEventsBasedObject(
      project,
      extension,
      object.getName(),
      safeAndUniqueName
    );
    object.setName(safeAndUniqueName);
    object = objects.get(safeAndUniqueName);
  }

  applyObjectFields(object, args);

  const summaryOnly = !!(args && args.summary_only);
  return {
    success: true,
    dryRun: false,
    created,
    wouldCreate: created,
    object: summarizeObject(object, !summaryOnly, !summaryOnly),
  };
};

export const deleteExtensionObject = (
  project: gdProject,
  args: Object
): Object => {
  const extensionName = normalizeRequiredName(
    args.extension_name,
    'extension_name'
  );
  const objectName = normalizeRequiredName(args.object_name, 'object_name');
  const objects = getExtension(project, extensionName).getEventsBasedObjects();
  if (!objects.has(objectName)) {
    throw new Error(`Events-based object not found: "${objectName}".`);
  }
  objects.remove(objectName);
  return {
    success: true,
    deletedObjectName: objectName,
  };
};

const renameProperty = ({
  project,
  extension,
  targetKind,
  target,
  properties,
  property,
  isShared,
  newName,
}: {|
  project: gdProject,
  extension: gdEventsFunctionsExtension,
  targetKind: string,
  target: gdEventsBasedBehavior | gdEventsBasedObject,
  properties: gdPropertiesContainer,
  property: gdNamedPropertyDescriptor,
  isShared: boolean,
  newName: string,
|}) => {
  if (newName === property.getName()) return;
  const oldName = property.getName();
  if (targetKind === 'behavior') {
    if (isShared) {
      gd.WholeProjectRefactorer.renameEventsBasedBehaviorSharedProperty(
        project,
        extension,
        ((target: any): gdEventsBasedBehavior),
        oldName,
        newName
      );
    } else {
      gd.WholeProjectRefactorer.renameEventsBasedBehaviorProperty(
        project,
        extension,
        ((target: any): gdEventsBasedBehavior),
        oldName,
        newName
      );
    }
  } else {
    gd.WholeProjectRefactorer.renameEventsBasedObjectProperty(
      project,
      extension,
      ((target: any): gdEventsBasedObject),
      oldName,
      newName
    );
  }
  property.setName(newName);
};

const applyPropertyFields = (
  property: gdNamedPropertyDescriptor,
  args: Object
) => {
  setStringIfProvided(property, 'setType', args, 'property_type');
  setStringIfProvided(property, 'setValue', args, 'value');
  setStringIfProvided(property, 'setLabel', args, 'label');
  setStringIfProvided(property, 'setDescription', args, 'description');
  setStringIfProvided(property, 'setMeasurementUnit', args, 'measurement_unit');
  setStringIfProvided(property, 'setGroup', args, 'group');
  setBooleanIfProvided(property, 'setHidden', args, 'is_hidden');
  setBooleanIfProvided(property, 'setAdvanced', args, 'is_advanced');
  setBooleanIfProvided(property, 'setDeprecated', args, 'is_deprecated');
  if (Array.isArray(args.extra_info)) {
    const vectorString = new gd.VectorString();
    args.extra_info
      .filter(item => typeof item === 'string')
      .forEach(item => vectorString.push_back(item));
    property.setExtraInfo(vectorString);
    vectorString.delete();
  }
  if (Array.isArray(args.choices)) {
    property.clearChoices();
    args.choices.forEach(choice => {
      if (!choice || typeof choice !== 'object') return;
      const value = typeof choice.value === 'string' ? choice.value : '';
      const label = typeof choice.label === 'string' ? choice.label : value;
      if (value) property.addChoice(value, label);
    });
  }
};

export const createOrUpdateExtensionProperty = (
  project: gdProject,
  args: Object
): Object => {
  const { extension, targetKind, target, properties } = getPropertiesContainer(
    project,
    args
  );
  const propertyName = normalizeRequiredName(
    args.property_name,
    'property_name'
  );
  const created = !properties.has(propertyName);
  let property = created
    ? properties.insertNew(propertyName, properties.getCount())
    : properties.get(propertyName);

  if (
    args.serialized_property &&
    typeof args.serialized_property === 'object'
  ) {
    unserializeFromJSObject(property, args.serialized_property);
    property.setName(propertyName);
  }

  const newPropertyName = normalizeOptionalName(
    args.new_property_name,
    'new_property_name'
  );
  if (newPropertyName && newPropertyName !== property.getName()) {
    const safeAndUniqueName = getSafeUniqueName(
      newPropertyName,
      name => properties.has(name),
      property.getName()
    );
    renameProperty({
      project,
      extension,
      targetKind,
      target,
      properties,
      property,
      isShared: !!args.is_shared,
      newName: safeAndUniqueName,
    });
    property = properties.get(safeAndUniqueName);
  }

  applyPropertyFields(property, args);

  return {
    success: true,
    created,
    targetKind,
    property: summarizeProperty(property, properties.getPosition(property)),
  };
};

export const deleteExtensionProperty = (
  project: gdProject,
  args: Object
): Object => {
  const { properties, targetKind } = getPropertiesContainer(project, args);
  const propertyName = normalizeRequiredName(
    args.property_name,
    'property_name'
  );
  if (!properties.has(propertyName)) {
    throw new Error(`Property not found: "${propertyName}".`);
  }
  properties.remove(propertyName);
  return {
    success: true,
    targetKind,
    deletedPropertyName: propertyName,
  };
};
