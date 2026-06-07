// @flow
import { renderNonTranslatedEventsAsText } from '../EventsSheet/EventsTree/TextRenderer';
import { mapFor, mapVector } from '../Utils/MapFor';
import {
  serializeToJSObject,
  serializeToJSON,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import { validateEventsJson } from './McpEventKnowledge';
import { findEventsInEventsList } from './McpEventTools';

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

const getOptionalNumber = (object: any, methodName: string): ?number =>
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
  const summary = {
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
  const summary = {
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
  const summary = {
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
  const summary = {
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
    (args.summary_only ||
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
  const sources = [];
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
  if (typeof eventsJson !== 'string') return null;

  const validation = validateEventsJson({
    project,
    sceneName: null,
    eventsJson,
  });
  if (!validation.valid) {
    throw new Error(
      `Invalid events_json: ${JSON.stringify(
        validation.errors || validation.issues || []
      )}`
    );
  }

  return JSON.parse(validation.normalizedEventsJson || eventsJson);
};

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
  if (typeof args.events_json === 'string') {
    const parsedEvents =
      parsedEventsJson || parseValidatedEventsJson(project, args.events_json);
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
  const parsedEventsJson = parseValidatedEventsJson(project, args.events_json);
  const { extension, parentKind, parent, container } = getFunctionParent(
    project,
    args
  );
  const functionName = normalizeRequiredName(
    args.function_name,
    'function_name'
  );
  const serializedExtensionBefore = serializeToJSObject(extension);

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

    const summaryOnly = !!(args && args.summary_only);
    const result = {
      success: true,
      dryRun: !!(args && args.dry_run),
      created,
      wouldCreate: created,
      parentKind,
      function: summarizeEventsFunction(
        eventsFunction,
        !summaryOnly,
        !summaryOnly
      ),
    };
    if (args && args.dry_run) {
      unserializeFromJSObject(
        extension,
        serializedExtensionBefore,
        'unserializeFrom',
        project
      );
    }
    return result;
  } catch (error) {
    unserializeFromJSObject(
      extension,
      serializedExtensionBefore,
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
  const extension = getExtension(project, extensionName);
  const objectName = normalizeRequiredName(args.object_name, 'object_name');
  const objects = extension.getEventsBasedObjects();
  const serializedExtensionBefore = serializeToJSObject(extension);

  try {
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
    const result = {
      success: true,
      dryRun: !!(args && args.dry_run),
      created,
      wouldCreate: created,
      object: summarizeObject(object, !summaryOnly, !summaryOnly),
    };
    if (args && args.dry_run) {
      unserializeFromJSObject(
        extension,
        serializedExtensionBefore,
        'unserializeFrom',
        project
      );
    }
    return result;
  } catch (error) {
    unserializeFromJSObject(
      extension,
      serializedExtensionBefore,
      'unserializeFrom',
      project
    );
    throw error;
  }
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
