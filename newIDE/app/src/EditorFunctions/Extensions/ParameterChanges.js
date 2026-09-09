// @flow
import { mapFor } from '../../Utils/MapFor';
import { ParametersIndexOffsets } from '../../EventsFunctionsExtensionsLoader';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';
import {
  type ResolvedScope,
  getFunctionsContainerOfScope as getFunctionsContainer,
  makeScopeProjectScopedContainersAccessor,
} from '../Scope';
import { getImplicitParametersCount } from '../SimplifiedProject/SimplifiedExtensions';
import {
  getSafeUniqueName,
  parseBoolean,
  parseNumber,
  renamedMessage,
  type FunctionOwner,
  listQuoted,
} from './NameHelpers';

const gd: libGDevelop = global.gd;

/** The parameter types offered by the function editor. */
export const PARAMETER_TYPES: Array<string> = [
  'objectList',
  'objectListOrEmptyIfJustDeclared',
  'behavior',
  'expression',
  'string',
  'stringWithSelector',
  'numberWithChoices',
  'keyboardKey',
  'mouseButton',
  'key',
  'mouse',
  'color',
  'layer',
  'sceneName',
  'yesorno',
  'trueorfalse',
  'objectPointName',
  'objectAnimationName',
  'layerEffectName',
  'layerEffectParameterName',
  'objectEffectName',
  'objectEffectParameterName',
  'leaderboardId',
  'identifier',
  'variable',
  'scenevar',
  'imageResource',
  'audioResource',
  'fontResource',
  'jsonResource',
  'videoResource',
  'tilemapResource',
  'tilesetResource',
  'bitmapFontResource',
  'model3DResource',
  'atlasResource',
  'spineResource',
];

/** One parameter of a function being created. */
export type ParameterSpec = {|
  name: string,
  type: string,
  label?: string,
  long_description?: string,
  extra_info?: string | Array<string>,
  optional?: boolean | string,
  default_value?: string,
|};

/** One entry of `changed_parameters`: creates, edits, moves or deletes one parameter. */
export type ParameterChange = {|
  parameter_name: string,
  new_name?: string,
  delete_this_parameter?: boolean,
  type?: string,
  label?: string,
  long_description?: string,
  extra_info?: string | Array<string>,
  optional?: boolean | string,
  default_value?: string,
  new_index?: number | string,
|};

export type ParameterSpecsResult =
  | {|
      success: true,
      parameterNames: Array<string>,
      messages: Array<string>,
    |}
  | {| success: false, message: string |};

export type ParameterChangesResult =
  | {| success: true, changedCount: number, messages: Array<string> |}
  | {| success: false, message: string |};

const makeFailure = (
  message: string
): {| success: false, message: string |} => ({
  success: false,
  message,
});

// `object` is only used by the implicit `Object` parameter GDevelop gives to
// the functions of a behavior or a custom object: a `behavior` parameter can
// bind to it like to any other object parameter.
const OBJECT_PARAMETER_TYPES = [
  'object',
  'objectList',
  'objectListOrEmptyIfJustDeclared',
];
const CHOICE_PARAMETER_TYPES = ['stringWithSelector', 'numberWithChoices'];

// `object` is the type name used in the events, `objectList` the one of the
// parameters: accept both everywhere.
const normalizeParameterType = (type: string): string =>
  type === 'object' ? 'objectList' : type;

// The name and type of the parameters, to check a whole call before applying it.
type SimulatedParameter = {| name: string, type: string |};

const getSimulatedParameters = (
  parameters: gdParameterMetadataContainer
): Array<SimulatedParameter> =>
  mapFor(0, parameters.getParametersCount(), index => {
    const parameter = parameters.getParameterAt(index);
    return { name: parameter.getName(), type: parameter.getType() };
  });

/**
 * The behavior parameters that no object parameter comes before: they can't be
 * filled by the caller of the function (a behavior is picked on an object).
 */
const getBehaviorParametersWithoutObject = (
  simulatedParameters: Array<SimulatedParameter>
): Array<string> => {
  const brokenNames = [];
  let hasObjectBefore = false;
  for (const parameter of simulatedParameters) {
    if (OBJECT_PARAMETER_TYPES.includes(parameter.type)) hasObjectBefore = true;
    else if (parameter.type === 'behavior' && !hasObjectBefore) {
      brokenNames.push(parameter.name);
    }
  }
  return brokenNames;
};

const getBehaviorRuleFailureMessage = (parameterNames: Array<string>): string =>
  `The "behavior" parameter${parameterNames.length > 1 ? 's' : ''} ${listQuoted(
    parameterNames
  )} must come after an object parameter (type ` +
  `"objectList" or "objectListOrEmptyIfJustDeclared"): the behavior is picked on the closest object parameter before it. ` +
  `Add an object parameter before it, or move it after one with \`new_index\`.`;

// The value stored by the bindings for `extra_info`, or the reason it can't be used.
const getParameterExtraInfo = (
  rawExtraInfo: string | Array<string>,
  type: string,
  parameterName: string
):
  | {| success: true, value: string |}
  | {| success: false, message: string |} => {
  const value = Array.isArray(rawExtraInfo)
    ? JSON.stringify(rawExtraInfo)
    : rawExtraInfo;
  if (typeof value !== 'string') {
    return {
      success: false,
      message: `\`extra_info\` of "${parameterName}" must be a string (or a list of choices for "stringWithSelector" and "numberWithChoices").`,
    };
  }
  if (type === 'identifier' && value !== '') {
    if (!value.startsWith('scene') && !value.startsWith('object')) {
      return {
        success: false,
        message:
          `\`extra_info\` of the "identifier" parameter "${parameterName}" is the scope ("scene" or "object") ` +
          `followed by the name of the identifier, like "sceneLevelName".`,
      };
    }
  }
  if (CHOICE_PARAMETER_TYPES.includes(type) && value !== '') {
    let parsedValue = null;
    try {
      parsedValue = JSON.parse(value);
    } catch (error) {
      parsedValue = null;
    }
    if (!Array.isArray(parsedValue)) {
      return {
        success: false,
        message:
          `\`extra_info\` of the "${type}" parameter "${parameterName}" is the list of the choices, ` +
          `like ["Small", "Big"] (or the same list as a JSON string).`,
      };
    }
  }
  return { success: true, value };
};

const getBehaviorExtraInfoFailure = (
  parameterName: string
): {| success: false, message: string |} => ({
  success: false,
  message:
    `The "behavior" parameter "${parameterName}" needs \`extra_info\` with the type of the required behavior, ` +
    `like "MyExtension::MyBehavior".`,
});

// The fields shared by `ParameterSpec` and `ParameterChange`, once checked.
type CheckedParameterFields = {|
  extraInfo: string | null,
  optional: boolean | null,
|};

type CheckedParameterFieldsResult =
  | {| success: true, fields: CheckedParameterFields |}
  | {| success: false, message: string |};

const checkParameterFields = (
  fields: ParameterSpec | ParameterChange,
  type: string,
  parameterName: string,
  hasExtraInfoAlready: boolean
): CheckedParameterFieldsResult => {
  let extraInfo = null;
  if (fields.extra_info !== undefined) {
    const parsedExtraInfo = getParameterExtraInfo(
      fields.extra_info,
      type,
      parameterName
    );
    if (!parsedExtraInfo.success) return parsedExtraInfo;
    extraInfo = parsedExtraInfo.value;
  }
  if (type === 'behavior' && !extraInfo && !hasExtraInfoAlready) {
    return getBehaviorExtraInfoFailure(parameterName);
  }
  let optional = null;
  if (fields.optional !== undefined) {
    const parsedOptional = parseBoolean(fields.optional, 'optional');
    if (!parsedOptional.success) {
      return { success: false, message: parsedOptional.message };
    }
    optional = parsedOptional.value;
  }
  return { success: true, fields: { extraInfo, optional } };
};

const setParameterFields = (
  parameter: gdParameterMetadata,
  fields: ParameterSpec | ParameterChange,
  checkedFields: CheckedParameterFields,
  details: Array<string>
) => {
  const { extraInfo, optional } = checkedFields;
  const {
    label,
    long_description: longDescription,
    default_value: defaultValue,
  } = fields;
  if (extraInfo !== null) {
    parameter.setExtraInfo(extraInfo);
    details.push(`extra info "${extraInfo}"`);
  }
  if (typeof label === 'string') {
    parameter.setDescription(label);
    details.push('label');
  }
  if (typeof longDescription === 'string') {
    parameter.setLongDescription(longDescription);
    details.push('long description');
  }
  if (optional !== null) {
    parameter.setOptional(optional);
    details.push(optional ? 'optional' : 'required');
  }
  if (typeof defaultValue === 'string') {
    parameter.setDefaultValue(defaultValue);
    details.push(`default value "${defaultValue}"`);
  }
};

// ---------------------------------------------------------------------------
// Parameters of a function being created.
// ---------------------------------------------------------------------------

type PlannedParameterSpec = {|
  spec: ParameterSpec,
  name: string,
  type: string,
  checkedFields: CheckedParameterFields,
  renameNotice: string | null,
|};

/**
 * Add the parameters of a function being created. The implicit parameters
 * (`Object`, `Behavior`) are added by
 * `ensure{Behavior,Object}EventsFunctionsProperParameters` afterwards.
 */
export const applyParameterSpecs = (
  eventsFunction: gdEventsFunction,
  specs: Array<ParameterSpec>
): ParameterSpecsResult => {
  const parameters = eventsFunction.getParameters();
  const simulatedParameters = getSimulatedParameters(parameters);
  const plannedSpecs: Array<PlannedParameterSpec> = [];

  for (const spec of specs) {
    const requestedName = typeof spec.name === 'string' ? spec.name.trim() : '';
    if (!requestedName) {
      return makeFailure(
        'Each parameter needs a `name`: the name used to read it in the events of the function.'
      );
    }
    const type = normalizeParameterType(
      typeof spec.type === 'string' ? spec.type.trim() : ''
    );
    if (!PARAMETER_TYPES.includes(type)) {
      return makeFailure(
        `Parameter "${requestedName}" needs a \`type\`, one of: ${listQuoted(
          PARAMETER_TYPES
        )}.`
      );
    }
    const checkedFields = checkParameterFields(
      spec,
      type,
      requestedName,
      false
    );
    if (!checkedFields.success) return makeFailure(checkedFields.message);
    const name = getSafeUniqueName(requestedName, someName =>
      simulatedParameters.some(parameter => parameter.name === someName)
    );
    simulatedParameters.push({ name, type });
    plannedSpecs.push({
      spec,
      name,
      type,
      checkedFields: checkedFields.fields,
      renameNotice: renamedMessage(requestedName, name),
    });
  }

  const brokenBehaviorNames = getBehaviorParametersWithoutObject(
    simulatedParameters
  );
  if (brokenBehaviorNames.length > 0) {
    return makeFailure(getBehaviorRuleFailureMessage(brokenBehaviorNames));
  }

  const messages: Array<string> = [];
  for (const plannedSpec of plannedSpecs) {
    const parameter = parameters.addNewParameter(plannedSpec.name);
    parameter.setType(plannedSpec.type);
    setParameterFields(
      parameter,
      plannedSpec.spec,
      plannedSpec.checkedFields,
      []
    );
    if (plannedSpec.renameNotice) messages.push(plannedSpec.renameNotice);
  }

  return {
    success: true,
    parameterNames: plannedSpecs.map(plannedSpec => plannedSpec.name),
    messages,
  };
};

// ---------------------------------------------------------------------------
// Parameters of an existing function.
// ---------------------------------------------------------------------------

const getFunctionOwner = (resolvedScope: ResolvedScope): FunctionOwner =>
  resolvedScope.eventsBasedBehavior
    ? 'behavior'
    : resolvedScope.eventsBasedObject
    ? 'object'
    : 'extension';

// The events of the project refer to a parameter of a free function with an
// extra offset: the generated function takes the scene as first parameter.
const getRefactorerIndexOffset = (owner: FunctionOwner): number =>
  owner === 'behavior'
    ? ParametersIndexOffsets.BehaviorFunction
    : owner === 'object'
    ? ParametersIndexOffsets.ObjectFunction
    : ParametersIndexOffsets.FreeFunction;

type PlannedParameterChange = {|
  change: ParameterChange,
  isNew: boolean,
  currentName: string,
  finalName: string,
  isDeleted: boolean,
  type: string | null,
  checkedFields: CheckedParameterFields,
  newIndex: number | null,
  renameNotice: string | null,
|};

/** Changes checked against the function, ready to be applied to it. */
export type PlannedParameterChanges = {|
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  owner: FunctionOwner,
  implicitParametersCount: number,
  changes: Array<PlannedParameterChange>,
  // The parameters of the function once the changes are applied (the implicit
  // ones included): what the caller checks its own rules against.
  finalParameters: Array<SimulatedParameter>,
|};

export type PlannedParameterChangesResult =
  | {| success: true, plannedChanges: PlannedParameterChanges |}
  | {| success: false, message: string |};

/** The parameters the author declares, once the changes are applied. */
export const getPlannedUserParametersCount = (
  plannedChanges: PlannedParameterChanges
): number =>
  Math.max(
    0,
    plannedChanges.finalParameters.length -
      plannedChanges.implicitParametersCount
  );

/**
 * Check every change of a call against the function, without touching it:
 * `applyPlannedParameterChanges` then applies them all.
 */
export const planParameterChanges = ({
  resolvedScope,
  eventsFunction,
  changes,
}: {|
  resolvedScope: ResolvedScope,
  eventsFunction: gdEventsFunction,
  changes: Array<ParameterChange>,
|}): PlannedParameterChangesResult => {
  const { eventsFunctionsExtension } = resolvedScope;
  const functionsContainer = getFunctionsContainer(resolvedScope);
  if (!eventsFunctionsExtension || !functionsContainer) {
    return makeFailure(
      `${
        resolvedScope.label
      } has no functions: use a scope of type "extension", "custom_behavior" or "custom_object" to change parameters.`
    );
  }
  const owner = getFunctionOwner(resolvedScope);
  const implicitParametersCount = getImplicitParametersCount(owner);
  const parameters = eventsFunction.getParameters();
  const simulatedParameters = getSimulatedParameters(parameters);
  // GDevelop gives the name `Value` to the parameter carrying the new value
  // in the actions with operator reading this function.
  const linkedSetterNames = getLinkedSetterNames(
    functionsContainer,
    eventsFunction.getName()
  );
  const getReservedNameRejection = (name: string): string | null =>
    name === 'Value' && linkedSetterNames.length > 0
      ? `"Value" is the name GDevelop gives to the new value received by ${listQuoted(
          linkedSetterNames
        )} (the ${
          linkedSetterNames.length > 1 ? 'actions' : 'action'
        } with operator reading "${eventsFunction.getName()}"): a parameter of "${eventsFunction.getName()}" cannot take it. Pick another name.`
      : null;
  const brokenBehaviorNamesBefore = getBehaviorParametersWithoutObject(
    simulatedParameters
  );
  const plannedChanges: Array<PlannedParameterChange> = [];

  for (const change of changes) {
    const {
      new_name: requestedNewName,
      type: requestedType,
      new_index: requestedIndex,
    } = change;
    const parameterName =
      typeof change.parameter_name === 'string'
        ? change.parameter_name.trim()
        : '';
    if (!parameterName) {
      return makeFailure(
        'Each entry of `changed_parameters` needs a `parameter_name`: the name of the parameter to create, edit or delete.'
      );
    }
    const index = simulatedParameters.findIndex(
      parameter => parameter.name === parameterName
    );
    const isExisting = index >= 0;
    const isImplicit = isExisting && index < implicitParametersCount;
    const userParameterNames = simulatedParameters
      .slice(implicitParametersCount)
      .map(parameter => parameter.name);

    if (isImplicit) {
      const isStructuralChange =
        requestedNewName !== undefined ||
        requestedType !== undefined ||
        requestedIndex !== undefined ||
        !!change.delete_this_parameter;
      if (isStructuralChange) {
        return makeFailure(
          `"${parameterName}" is given to every function of ${
            resolvedScope.label
          } by GDevelop: it can't be renamed, retyped, moved or deleted. Parameters you can change: ${listQuoted(
            userParameterNames
          )}.`
        );
      }
    }

    if (change.delete_this_parameter) {
      if (!isExisting) {
        return makeFailure(
          `Parameter "${parameterName}" not found: it cannot be deleted. Existing parameters: ${listQuoted(
            userParameterNames
          )}.`
        );
      }
      simulatedParameters.splice(index, 1);
      plannedChanges.push({
        change,
        isNew: false,
        currentName: parameterName,
        finalName: parameterName,
        isDeleted: true,
        type: null,
        checkedFields: { extraInfo: null, optional: null },
        newIndex: null,
        renameNotice: null,
      });
      continue;
    }

    let type = null;
    if (requestedType !== undefined) {
      const normalizedType = normalizeParameterType(
        typeof requestedType === 'string' ? requestedType.trim() : ''
      );
      if (!PARAMETER_TYPES.includes(normalizedType)) {
        return makeFailure(
          `Parameter type "${String(
            requestedType
          )}" does not exist. Allowed types: ${listQuoted(PARAMETER_TYPES)}.`
        );
      }
      type = normalizedType;
    } else if (!isExisting) {
      return makeFailure(
        `Parameter "${parameterName}" not found in the function. Existing parameters: ${listQuoted(
          userParameterNames
        )}. Pass \`type\` to create it instead, one of: ${listQuoted(
          PARAMETER_TYPES
        )}.`
      );
    }
    const finalType =
      type || (isExisting ? simulatedParameters[index].type : '');
    const hasExtraInfoAlready =
      isExisting &&
      parameters.hasParameterNamed(parameterName) &&
      parameters.getParameter(parameterName).getExtraInfo() !== '';
    const checkedFields = checkParameterFields(
      change,
      finalType,
      parameterName,
      hasExtraInfoAlready
    );
    if (!checkedFields.success) return makeFailure(checkedFields.message);

    let finalName = parameterName;
    let renameNotice = null;
    if (!isExisting) {
      const reservedNameRejection = getReservedNameRejection(parameterName);
      if (reservedNameRejection) return makeFailure(reservedNameRejection);
      finalName = getSafeUniqueName(parameterName, someName =>
        simulatedParameters.some(parameter => parameter.name === someName)
      );
      renameNotice = renamedMessage(parameterName, finalName);
      simulatedParameters.push({ name: finalName, type: finalType });
    } else {
      if (requestedNewName !== undefined) {
        if (
          typeof requestedNewName !== 'string' ||
          requestedNewName.trim() === ''
        ) {
          return makeFailure(
            `\`new_name\` of "${parameterName}" must be a non-empty name.`
          );
        }
        const newName = requestedNewName.trim();
        const reservedNameRejection = getReservedNameRejection(newName);
        if (reservedNameRejection) return makeFailure(reservedNameRejection);
        finalName = getSafeUniqueName(
          newName,
          someName =>
            someName !== parameterName &&
            simulatedParameters.some(parameter => parameter.name === someName)
        );
        renameNotice = renamedMessage(newName, finalName);
        simulatedParameters[index].name = finalName;
      }
      if (type) simulatedParameters[index].type = type;
    }

    let newIndex = null;
    if (requestedIndex !== undefined) {
      const parsedIndex = parseNumber(requestedIndex, 'new_index');
      if (!parsedIndex.success) return makeFailure(parsedIndex.message);
      const userParametersCount =
        simulatedParameters.length - implicitParametersCount;
      if (
        !Number.isInteger(parsedIndex.value) ||
        parsedIndex.value < 0 ||
        parsedIndex.value >= userParametersCount
      ) {
        return makeFailure(
          `\`new_index\` of "${finalName}" must be between 0 and ${userParametersCount -
            1} (the position among the ${userParametersCount} parameters you can change).`
        );
      }
      newIndex = parsedIndex.value;
      const movedIndex = simulatedParameters.findIndex(
        parameter => parameter.name === finalName
      );
      const [movedParameter] = simulatedParameters.splice(movedIndex, 1);
      simulatedParameters.splice(
        implicitParametersCount + newIndex,
        0,
        movedParameter
      );
    }

    plannedChanges.push({
      change,
      isNew: !isExisting,
      currentName: parameterName,
      finalName,
      isDeleted: false,
      type,
      checkedFields: checkedFields.fields,
      newIndex,
      renameNotice,
    });
  }

  const brokenBehaviorNames = getBehaviorParametersWithoutObject(
    simulatedParameters
  ).filter(name => !brokenBehaviorNamesBefore.includes(name));
  if (brokenBehaviorNames.length > 0) {
    return makeFailure(getBehaviorRuleFailureMessage(brokenBehaviorNames));
  }

  return {
    success: true,
    plannedChanges: {
      eventsFunctionsExtension,
      owner,
      implicitParametersCount,
      changes: plannedChanges,
      finalParameters: simulatedParameters,
    },
  };
};

/**
 * Create, edit, move and delete the parameters of a function, updating the
 * events using them. Every change is checked first: nothing is applied when
 * one of them is refused.
 */
export const applyParameterChanges = ({
  project,
  resolvedScope,
  eventsFunction,
  accessor,
  changes,
}: {|
  project: gdProject,
  resolvedScope: ResolvedScope,
  eventsFunction: gdEventsFunction,
  accessor: ProjectScopedContainersAccessor,
  changes: Array<ParameterChange>,
|}): ParameterChangesResult => {
  const plannedChangesResult = planParameterChanges({
    resolvedScope,
    eventsFunction,
    changes,
  });
  if (!plannedChangesResult.success) return plannedChangesResult;
  return applyPlannedParameterChanges({
    project,
    resolvedScope,
    eventsFunction,
    accessor,
    plannedChanges: plannedChangesResult.plannedChanges,
  });
};

/**
 * The objects declared by the parameters of the function, taken from the
 * project scoped containers themselves: the refactorers only rename an object
 * parameter in the events when they are given that very container.
 */
const getParameterObjectsContainer = (
  projectScopedContainers: gdProjectScopedContainers,
  objectName: string
): gdObjectsContainer | null => {
  const objectsContainersList = projectScopedContainers.getObjectsContainersList();
  const containersCount = objectsContainersList.getObjectsContainersCount();
  if (containersCount === 0) return null;
  for (let index = containersCount - 1; index >= 0; index--) {
    const objectsContainer = objectsContainersList.getObjectsContainer(index);
    if (objectsContainer.hasObjectNamed(objectName)) return objectsContainer;
  }
  // Not an object parameter: the refactorers won't read the container.
  return objectsContainersList.getObjectsContainer(containersCount - 1);
};

const renameParameterInEvents = (
  project: gdProject,
  accessor: ProjectScopedContainersAccessor,
  eventsFunction: gdEventsFunction,
  oldName: string,
  newName: string
) => {
  const projectScopedContainers = accessor.get();
  const objectsContainer = getParameterObjectsContainer(
    projectScopedContainers,
    oldName
  );
  if (!objectsContainer) return;
  gd.WholeProjectRefactorer.renameParameter(
    project,
    projectScopedContainers,
    eventsFunction,
    objectsContainer,
    oldName,
    newName
  );
};

const changeParameterTypeInEvents = (
  project: gdProject,
  accessor: ProjectScopedContainersAccessor,
  eventsFunction: gdEventsFunction,
  parameterName: string
) => {
  const projectScopedContainers = accessor.get();
  const objectsContainer = getParameterObjectsContainer(
    projectScopedContainers,
    parameterName
  );
  if (!objectsContainer) return;
  gd.WholeProjectRefactorer.changeParameterType(
    project,
    projectScopedContainers,
    eventsFunction,
    objectsContainer,
    parameterName
  );
};

/** The names of the `ActionWithOperator` functions reading `getterName`. */
export const getLinkedSetterNames = (
  functionsContainer: gdEventsFunctionsContainer,
  getterName: string
): Array<string> =>
  mapFor(0, functionsContainer.getEventsFunctionsCount(), index =>
    functionsContainer.getEventsFunctionAt(index)
  )
    .filter(
      candidate =>
        candidate.getFunctionType() === gd.EventsFunction.ActionWithOperator &&
        candidate.getGetterName() === getterName
    )
    .map(setter => setter.getName());

/**
 * Run `callback` on every `ActionWithOperator` reading its value from
 * `getter`, with the scoped containers of that setter: its events use the
 * parameters of the getter (Core builds them from it), so a rename or a type
 * change of one of those parameters must reach its events too.
 */
const forEachLinkedSetter = (
  project: gdProject,
  resolvedScope: ResolvedScope,
  getter: gdEventsFunction,
  callback: (
    setter: gdEventsFunction,
    accessor: ProjectScopedContainersAccessor
  ) => void
) => {
  const functionsContainer = getFunctionsContainer(resolvedScope);
  if (!functionsContainer) return;
  for (const setterName of getLinkedSetterNames(
    functionsContainer,
    getter.getName()
  )) {
    const setter = functionsContainer.getEventsFunction(setterName);
    const { accessor, dispose } = makeScopeProjectScopedContainersAccessor(
      project,
      resolvedScope,
      setter
    );
    try {
      callback(setter, accessor);
    } finally {
      dispose();
    }
  }
};

/**
 * Switch the variable instructions of the `ActionWithOperator` functions
 * reading `getter` to the type it now returns: the `Value` they receive is of
 * that type (Core generates it from the getter).
 */
export const changeGetterValueTypeInSetterEvents = ({
  project,
  resolvedScope,
  getter,
}: {|
  project: gdProject,
  resolvedScope: ResolvedScope,
  getter: gdEventsFunction,
|}) => {
  forEachLinkedSetter(project, resolvedScope, getter, (setter, accessor) =>
    changeParameterTypeInEvents(project, accessor, setter, 'Value')
  );
};

export const applyPlannedParameterChanges = ({
  project,
  resolvedScope,
  eventsFunction,
  accessor,
  plannedChanges,
}: {|
  project: gdProject,
  resolvedScope: ResolvedScope,
  eventsFunction: gdEventsFunction,
  accessor: ProjectScopedContainersAccessor,
  plannedChanges: PlannedParameterChanges,
|}): ParameterChangesResult => {
  const {
    eventsFunctionsExtension,
    owner,
    implicitParametersCount,
  } = plannedChanges;
  const parameters = eventsFunction.getParameters();
  const messages: Array<string> = [];
  let changedCount = 0;

  // The events of the actions with operator reading this function use its
  // parameters (Core builds them from it), and their calls list them: every
  // rename, type change and move is applied to the function, then to them.
  const functionsContainer = getFunctionsContainer(resolvedScope);
  const linkedSetterNames = functionsContainer
    ? getLinkedSetterNames(functionsContainer, eventsFunction.getName())
    : [];
  const applyToFunctionAndLinkedSetters = (
    callback: (
      refactoredFunction: gdEventsFunction,
      refactoredAccessor: ProjectScopedContainersAccessor
    ) => void
  ) => {
    callback(eventsFunction, accessor);
    if (!functionsContainer) return;
    for (const setterName of linkedSetterNames) {
      const setter = functionsContainer.getEventsFunction(setterName);
      const setterAccessor = makeScopeProjectScopedContainersAccessor(
        project,
        resolvedScope,
        setter
      );
      try {
        callback(setter, setterAccessor.accessor);
      } finally {
        setterAccessor.dispose();
      }
    }
  };

  for (const plannedChange of plannedChanges.changes) {
    const { change, currentName, finalName } = plannedChange;
    const details: Array<string> = [];

    if (plannedChange.isDeleted) {
      parameters.removeParameter(currentName);
      changedCount++;
      messages.push(
        `Deleted parameter "${currentName}": the events and instructions still using it are now invalid - update them, or create the parameter again.`
      );
      continue;
    }

    let parameter;
    if (plannedChange.isNew) {
      parameter = parameters.addNewParameter(finalName);
      parameter.setType(plannedChange.type || 'expression');
      details.push(`type "${parameter.getType()}"`);
    } else {
      parameter = parameters.getParameter(currentName);
      if (finalName !== currentName) {
        applyToFunctionAndLinkedSetters(
          (refactoredFunction, refactoredAccessor) =>
            renameParameterInEvents(
              project,
              refactoredAccessor,
              refactoredFunction,
              currentName,
              finalName
            )
        );
        parameter.setName(finalName);
        details.push(`renamed from "${currentName}"`);
      }
      const type = plannedChange.type;
      if (type && type !== parameter.getType()) {
        parameter.setType(type);
        applyToFunctionAndLinkedSetters(
          (refactoredFunction, refactoredAccessor) =>
            changeParameterTypeInEvents(
              project,
              refactoredAccessor,
              refactoredFunction,
              finalName
            )
        );
        details.push(`type set to "${type}"`);
      }
    }

    setParameterFields(parameter, change, plannedChange.checkedFields, details);

    const userIndex = plannedChange.newIndex;
    if (userIndex !== null) {
      const oldIndex = parameters.getParameterPosition(parameter);
      const newIndex = implicitParametersCount + userIndex;
      if (oldIndex !== newIndex) {
        for (const functionName of [
          eventsFunction.getName(),
          ...linkedSetterNames,
        ]) {
          moveParameter({
            project,
            eventsFunctionsExtension,
            resolvedScope,
            functionName,
            owner,
            oldIndex,
            newIndex,
          });
        }
        parameters.moveParameter(oldIndex, newIndex);
        details.push(`moved to position ${userIndex}`);
      }
    }

    if (details.length > 0) {
      changedCount++;
      messages.push(
        plannedChange.isNew
          ? `Created parameter "${finalName}" (${details.join(', ')}).`
          : `Parameter "${finalName}": ${details.join(', ')}.`
      );
    }
    if (plannedChange.renameNotice) messages.push(plannedChange.renameNotice);
  }

  return { success: true, changedCount, messages };
};

const moveParameter = ({
  project,
  eventsFunctionsExtension,
  resolvedScope,
  functionName,
  owner,
  oldIndex,
  newIndex,
}: {|
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  resolvedScope: ResolvedScope,
  functionName: string,
  owner: FunctionOwner,
  oldIndex: number,
  newIndex: number,
|}) => {
  const offset = getRefactorerIndexOffset(owner);
  const { eventsBasedBehavior, eventsBasedObject } = resolvedScope;
  if (eventsBasedBehavior) {
    gd.WholeProjectRefactorer.moveBehaviorEventsFunctionParameter(
      project,
      eventsFunctionsExtension,
      eventsBasedBehavior,
      functionName,
      oldIndex + offset,
      newIndex + offset
    );
  } else if (eventsBasedObject) {
    gd.WholeProjectRefactorer.moveObjectEventsFunctionParameter(
      project,
      eventsFunctionsExtension,
      eventsBasedObject,
      functionName,
      oldIndex + offset,
      newIndex + offset
    );
  } else {
    gd.WholeProjectRefactorer.moveEventsFunctionParameter(
      project,
      eventsFunctionsExtension,
      functionName,
      oldIndex + offset,
      newIndex + offset
    );
  }
};
