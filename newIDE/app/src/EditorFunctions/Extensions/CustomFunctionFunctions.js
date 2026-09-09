// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Link from '../../UI/Link';
import { mapFor } from '../../Utils/MapFor';
import { SafeExtractor } from '../../Utils/SafeExtractor';
import { ParametersIndexOffsets } from '../../EventsFunctionsExtensionsLoader';
import {
  type EditorFunction,
  type EditorFunctionGenericOutput,
} from '../index';
import {
  type ProjectItemRenamedOutsideEditorChanges,
  type WillDeleteExtensionItemChanges,
} from '../OutsideEditorChanges';
import { extractRequiredString, makeGenericFailure } from '../Utils';
import {
  getReadOnlyRejection,
  makeScopeProjectScopedContainersAccessor,
  resolveScopeFromArgs,
  type ResolvedScope,
  type ToolScopeType,
  getFunctionsContainerOfScope as getFunctionsContainer,
} from '../Scope';
import {
  getFunctionTypeAsString,
  getImplicitParametersCount,
  getSimplifiedFunction,
  type FunctionOwner,
  type SimplifiedFunction,
  type SimplifiedParameter,
} from '../SimplifiedProject/SimplifiedExtensions';
import {
  getCallFormsAndInstructionType,
  makeCallFormContext,
  type CallFormContext,
} from './InspectExtension';
import {
  applyParameterSpecs,
  applyPlannedParameterChanges,
  getPlannedUserParametersCount,
  planParameterChanges,
  type ParameterChange,
  type ParameterSpec,
  type PlannedParameterChanges,
} from './ParameterChanges';
import {
  getEnumSettingValue,
  getLifecycleFunctionNames,
  isLifecycleFunctionName,
  parseBoolean,
  readOptionalBoolean,
  renamedMessage,
  listQuoted,
  getRequestedNewName,
  type ParsedValue,
} from './NameHelpers';

const gd: libGDevelop = global.gd;

const FUNCTION_SCOPE_TYPES: Array<ToolScopeType> = [
  'extension',
  'custom_behavior',
  'custom_object',
];

/** The kinds of function offered by the function editor. */
export const FUNCTION_TYPES = [
  'Action',
  'Condition',
  'Expression',
  'StringExpression',
  'ExpressionAndCondition',
  'ActionWithOperator',
];

// The types that return a value: they need a getter (or are one).
const EXPRESSION_FUNCTION_TYPES = [
  'Expression',
  'StringExpression',
  'ExpressionAndCondition',
];

/** What a function returns, as `expression_type` names it. */
const EXPRESSION_TYPES = ['number', 'string'];
// The types a new function declares a return type for: `StringExpression` is
// the legacy way of writing an `Expression` returning a string.
const EXPRESSION_TYPE_FUNCTION_TYPES = ['Expression', 'ExpressionAndCondition'];

const FUNCTION_SETTING_NAMES = [
  'fullName',
  'description',
  'sentence',
  'group',
  'getterName',
  'isPrivate',
  'isAsync',
  'functionType',
  'expressionType',
  'helpUrl',
  'isDeprecated',
  'deprecationMessage',
];
const METADATA_ONLY_SETTING_NAMES = [
  'fullName',
  'description',
  'sentence',
  'group',
  'helpUrl',
  'deprecationMessage',
];

const OWNER_LABELS: { [FunctionOwner]: string } = {
  extension: 'an extension (its free functions)',
  behavior: 'a custom behavior',
  object: 'a custom object',
};
const OWNER_SCOPE_TYPES: { [FunctionOwner]: string } = {
  extension: 'extension',
  behavior: 'custom_behavior',
  object: 'custom_object',
};

const getFunctionOwner = (resolvedScope: ResolvedScope): FunctionOwner =>
  resolvedScope.eventsBasedBehavior
    ? 'behavior'
    : resolvedScope.eventsBasedObject
    ? 'object'
    : 'extension';

const getOwnerName = (resolvedScope: ResolvedScope): string | null => {
  const { eventsBasedBehavior, eventsBasedObject } = resolvedScope;
  if (eventsBasedBehavior) return eventsBasedBehavior.getName();
  if (eventsBasedObject) return eventsBasedObject.getName();
  return null;
};

const getFunctionNames = (
  functionsContainer: gdEventsFunctionsContainer
): Array<string> =>
  mapFor(0, functionsContainer.getEventsFunctionsCount(), index =>
    functionsContainer.getEventsFunctionAt(index).getName()
  );

/** `StringExpression` is an `Expression` returning a string. */
const getFunctionTypeName = (eventsFunction: gdEventsFunction): string => {
  const functionType = getFunctionTypeAsString(gd, eventsFunction);
  return functionType === 'Expression' &&
    eventsFunction.getExpressionType().getName() === 'string'
    ? 'StringExpression'
    : functionType;
};

/**
 * The project reports a number as `expression` (the name GDevelop gives to
 * that value type): accept it where `number` is expected.
 */
const normalizeExpressionType = (value: mixed): mixed =>
  value === 'expression' ? 'number' : value;

/** What the function returns, as `expression_type` names it. */
const getExpressionTypeName = (eventsFunction: gdEventsFunction): string =>
  eventsFunction.getExpressionType().getName() === 'string'
    ? 'string'
    : 'number';

// `expression` is the name GDevelop gives to a number in a value type.
const setExpressionTypeName = (
  eventsFunction: gdEventsFunction,
  expressionType: string
) => {
  const valueTypeMetadata = new gd.ValueTypeMetadata();
  valueTypeMetadata.setName(
    expressionType === 'string' ? 'string' : 'expression'
  );
  eventsFunction.setExpressionType(valueTypeMetadata);
  valueTypeMetadata.delete();
};

/** Change what a function returns, and the return action of its events with it. */
const setExpressionType = (
  project: gdProject,
  eventsFunction: gdEventsFunction,
  expressionType: string
) => {
  setExpressionTypeName(eventsFunction, expressionType);
  gd.PropertyFunctionGenerator.updateReturnActionType(project, eventsFunction);
};

const setFunctionTypeName = (
  eventsFunction: gdEventsFunction,
  name: string
) => {
  eventsFunction.setFunctionType(
    name === 'Condition'
      ? gd.EventsFunction.Condition
      : name === 'Expression' || name === 'StringExpression'
      ? gd.EventsFunction.Expression
      : name === 'ExpressionAndCondition'
      ? gd.EventsFunction.ExpressionAndCondition
      : name === 'ActionWithOperator'
      ? gd.EventsFunction.ActionWithOperator
      : gd.EventsFunction.Action
  );
  if (name === 'Expression' || name === 'StringExpression') {
    setExpressionTypeName(
      eventsFunction,
      name === 'StringExpression' ? 'string' : 'number'
    );
  }
};

/**
 * The `expression_type` of a call: `null` when not given, or the reason it
 * can't be used on this kind of function.
 */
const readExpressionType = (
  args: any,
  functionTypeName: string
): ParsedValue<string | null> => {
  const rawExpressionType = args ? args.expression_type : undefined;
  if (rawExpressionType === undefined || rawExpressionType === null)
    return { success: true, value: null };
  if (!EXPRESSION_TYPE_FUNCTION_TYPES.includes(functionTypeName)) {
    return {
      success: false,
      message:
        `\`expression_type\` says what a function returns: it only applies to a \`function_type\` of ${listQuoted(
          EXPRESSION_TYPE_FUNCTION_TYPES
        )} (got "${functionTypeName}")` +
        (functionTypeName === 'StringExpression'
          ? ', and a "StringExpression" already returns a string.'
          : '.'),
    };
  }
  const parsedExpressionType = getEnumSettingValue(
    normalizeExpressionType(rawExpressionType),
    EXPRESSION_TYPES,
    'expression_type'
  );
  return parsedExpressionType.success
    ? { success: true, value: parsedExpressionType.value }
    : parsedExpressionType;
};

/** The events the editor puts in a new function so it returns something. */
const generateFunctionSkeleton = (
  project: gdProject,
  eventsFunction: gdEventsFunction
) => {
  if (eventsFunction.getEvents().getEventsCount() > 0) return;
  if (eventsFunction.isExpression()) {
    gd.PropertyFunctionGenerator.generateExpressionSkeleton(
      project,
      eventsFunction
    );
    gd.PropertyFunctionGenerator.updateReturnActionType(
      project,
      eventsFunction
    );
  } else if (eventsFunction.isCondition()) {
    gd.PropertyFunctionGenerator.generateConditionSkeleton(
      project,
      eventsFunction
    );
  }
};

/** GDevelop gives the functions of a behavior or a custom object their first parameters. */
const ensureProperParameters = (resolvedScope: ResolvedScope) => {
  const {
    eventsFunctionsExtension,
    eventsBasedBehavior,
    eventsBasedObject,
  } = resolvedScope;
  if (!eventsFunctionsExtension) return;
  if (eventsBasedBehavior) {
    gd.WholeProjectRefactorer.ensureBehaviorEventsFunctionsProperParameters(
      eventsFunctionsExtension,
      eventsBasedBehavior
    );
  } else if (eventsBasedObject) {
    gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
      eventsFunctionsExtension,
      eventsBasedObject
    );
  }
};

/**
 * The sentence shown in the events sheet when none was given: the name of the
 * function followed by every parameter it displays. Mirrors what the editor
 * expects (`SentenceErrorMessage.js`): behaviors are never shown, and the
 * object of an `ExpressionAndCondition` is added by GDevelop itself.
 */
const getDefaultSentence = (
  eventsFunction: gdEventsFunction,
  owner: FunctionOwner
): string => {
  const parametersIndexOffset =
    owner === 'extension' ? ParametersIndexOffsets.FreeFunction : 0;
  const isFirstParameterImplicitInSentence =
    owner !== 'extension' &&
    eventsFunction.getFunctionType() ===
      gd.EventsFunction.ExpressionAndCondition;
  const parameters = eventsFunction.getParameters();
  const sentenceParts = [
    eventsFunction.getFullName() || eventsFunction.getName(),
  ];
  for (let index = 0; index < parameters.getParametersCount(); index++) {
    if (index === 0 && isFirstParameterImplicitInSentence) continue;
    if (
      parameters
        .getParameterAt(index)
        .getValueTypeMetadata()
        .isBehavior()
    )
      continue;
    sentenceParts.push(`_PARAM${index + parametersIndexOffset}_`);
  }
  return sentenceParts.join(' ');
};

const hasSentence = (functionTypeName: string): boolean =>
  functionTypeName === 'Action' ||
  functionTypeName === 'Condition' ||
  functionTypeName === 'ExpressionAndCondition';

// ---------------------------------------------------------------------------
// EventScript call forms.
// ---------------------------------------------------------------------------

const getUserParameterNames = (
  context: CallFormContext,
  parameters: Array<SimplifiedParameter>
): Array<string> =>
  parameters
    .slice(getImplicitParametersCount(context.owner))
    .map(parameter => parameter.name);

const renderDeclaredInstructionCallForm = (
  context: CallFormContext,
  simplifiedFunction: SimplifiedFunction,
  parameters: Array<SimplifiedParameter>,
  operator: string | null
): string => {
  const instructionType = context.ownerType
    ? `${context.ownerType}::${simplifiedFunction.functionName}`
    : `${context.extensionName}::${simplifiedFunction.functionName}`;
  const implicitArguments =
    context.owner === 'behavior'
      ? ['Object', 'Behavior']
      : context.owner === 'object'
      ? ['Object']
      : [];
  const callArguments = [
    ...implicitArguments,
    ...getUserParameterNames(context, parameters),
    ...(operator ? [operator, 'Value'] : []),
  ];
  return `${
    simplifiedFunction.isAsync ? 'await ' : ''
  }${instructionType}(${callArguments.join(', ')})`;
};

const renderDeclaredExpressionCallForm = (
  context: CallFormContext,
  functionName: string,
  parameters: Array<SimplifiedParameter>
): string => {
  const prefix =
    context.owner === 'object'
      ? 'Object.'
      : context.owner === 'behavior'
      ? 'Object.Behavior::'
      : `${context.extensionName}::`;
  return `${prefix}${functionName}(${getUserParameterNames(
    context,
    parameters
  ).join(', ')})`;
};

/**
 * The call forms read from the declaration of the function: used when the
 * editor has not generated the metadata of the extension yet.
 */
const getDeclaredCallForms = (
  context: CallFormContext,
  simplifiedFunction: SimplifiedFunction,
  getterFunction: SimplifiedFunction | null
): Array<string> => {
  if (simplifiedFunction.isLifecycle) return [];
  const { functionName, functionType } = simplifiedFunction;
  // An `ActionWithOperator` takes the parameters of its getter.
  const parameters = getterFunction
    ? getterFunction.parameters
    : simplifiedFunction.parameters;
  const callForms = [];
  if (functionType === 'Action' || functionType === 'Condition') {
    callForms.push(
      renderDeclaredInstructionCallForm(
        context,
        simplifiedFunction,
        parameters,
        null
      )
    );
  } else if (functionType === 'ActionWithOperator') {
    callForms.push(
      renderDeclaredInstructionCallForm(
        context,
        simplifiedFunction,
        parameters,
        '='
      )
    );
  } else if (functionType === 'Expression') {
    callForms.push(
      renderDeclaredExpressionCallForm(context, functionName, parameters)
    );
  } else if (functionType === 'ExpressionAndCondition') {
    callForms.push(
      renderDeclaredExpressionCallForm(context, functionName, parameters)
    );
    callForms.push(
      renderDeclaredInstructionCallForm(
        context,
        simplifiedFunction,
        parameters,
        '>'
      )
    );
  }
  if (functionType === 'ActionWithOperator' && simplifiedFunction.getterName) {
    callForms.push(
      `read the value with ${renderDeclaredExpressionCallForm(
        context,
        simplifiedFunction.getterName,
        getterFunction ? getterFunction.parameters : []
      )}`
    );
  }
  return callForms;
};

/**
 * How the function is called from EventScript: read from the generated
 * metadata when the editor has it, from the declaration otherwise.
 */
const getCallForms = (
  resolvedScope: ResolvedScope,
  functionsContainer: gdEventsFunctionsContainer,
  eventsFunction: gdEventsFunction
): Array<string> => {
  const { eventsFunctionsExtension } = resolvedScope;
  if (!eventsFunctionsExtension) return [];
  const owner = getFunctionOwner(resolvedScope);
  const context = makeCallFormContext(
    eventsFunctionsExtension.getName(),
    owner,
    getOwnerName(resolvedScope)
  );
  const simplifiedFunction = getSimplifiedFunction(
    gd,
    eventsFunction,
    owner,
    functionsContainer
  );
  const getterName = simplifiedFunction.getterName;
  const getterFunction =
    simplifiedFunction.functionType === 'ActionWithOperator' &&
    getterName &&
    functionsContainer.hasEventsFunctionNamed(getterName)
      ? getSimplifiedFunction(
          gd,
          functionsContainer.getEventsFunction(getterName),
          owner,
          functionsContainer
        )
      : null;
  const { callForms } = getCallFormsAndInstructionType(
    gd.JsPlatform.get(),
    context,
    simplifiedFunction,
    getterFunction
  );
  return callForms.length > 0
    ? callForms
    : getDeclaredCallForms(context, simplifiedFunction, getterFunction);
};

// ---------------------------------------------------------------------------
// Shared checks.
// ---------------------------------------------------------------------------

type ScopeAndFunctionsContainer = {|
  resolvedScope: ResolvedScope,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  functionsContainer: gdEventsFunctionsContainer,
  owner: FunctionOwner,
|};

const resolveFunctionsContainerOfCall = (
  project: gdProject,
  args: any
):
  | {| success: true, ...ScopeAndFunctionsContainer |}
  | {| success: false, message: string |} => {
  const resolvedScope = resolveScopeFromArgs(project, args, {
    allowedTypes: FUNCTION_SCOPE_TYPES,
  });
  if (!resolvedScope.success) return resolvedScope;
  const readOnlyRejection = getReadOnlyRejection(resolvedScope);
  if (readOnlyRejection) return readOnlyRejection;
  const { eventsFunctionsExtension } = resolvedScope;
  const functionsContainer = getFunctionsContainer(resolvedScope);
  if (!eventsFunctionsExtension || !functionsContainer) {
    return {
      success: false,
      message: `${
        resolvedScope.label
      } has no functions: use a scope of type "extension", "custom_behavior" or "custom_object".`,
    };
  }
  return {
    success: true,
    resolvedScope,
    eventsFunctionsExtension,
    functionsContainer,
    owner: getFunctionOwner(resolvedScope),
  };
};

/**
 * The lifecycle functions are called by the game engine under a fixed name:
 * they only exist on one kind of owner, and take no parameter.
 */
const getLifecycleRejection = ({
  functionName,
  owner,
  scopeLabel,
  functionTypeName,
  parametersCount,
  // How the call names what it asks for, to say what to remove from it.
  typeField = '`function_type`',
  parametersField = '`parameters`',
}: {|
  functionName: string,
  owner: FunctionOwner,
  scopeLabel: string,
  functionTypeName: string | null,
  parametersCount: number,
  typeField?: string,
  parametersField?: string,
|}): string | null => {
  if (isLifecycleFunctionName(owner, functionName)) {
    if (functionTypeName !== null && functionTypeName !== 'Action') {
      return `"${functionName}" is a lifecycle function called by GDevelop on ${
        OWNER_LABELS[owner]
      }: it is always an Action. Remove ${typeField}, or give the function another name.`;
    }
    if (parametersCount > 0) {
      return `"${functionName}" is a lifecycle function called by GDevelop on ${
        OWNER_LABELS[owner]
      }: it takes no parameter (GDevelop has nothing to fill them with). Remove ${parametersField}, or give the function another name to make it a regular action.`;
    }
    return null;
  }
  const otherOwner = ['extension', 'behavior', 'object'].find(
    someOwner =>
      someOwner !== owner &&
      isLifecycleFunctionName((someOwner: any), functionName)
  );
  if (otherOwner) {
    return `"${functionName}" is a lifecycle function name of ${
      OWNER_LABELS[(otherOwner: any)]
    }: GDevelop would never call it on ${scopeLabel}. The lifecycle functions of ${
      OWNER_LABELS[owner]
    } are ${listQuoted(
      getLifecycleFunctionNames(owner)
    )}. Give the function another name, or create it with a scope of type "${
      OWNER_SCOPE_TYPES[(otherOwner: any)]
    }".`;
  }
  return null;
};

const getGetterRejection = (
  functionsContainer: gdEventsFunctionsContainer,
  getterName: string | null
): string | null => {
  const expressionNames = getFunctionNames(functionsContainer).filter(name =>
    EXPRESSION_FUNCTION_TYPES.includes(
      getFunctionTypeName(functionsContainer.getEventsFunction(name))
    )
  );
  if (!getterName) {
    return `An "ActionWithOperator" changes the value read by another function: pass \`getter_name\`, the name of its "Expression" or "ExpressionAndCondition". Available getters: ${listQuoted(
      expressionNames
    )}.`;
  }
  if (!expressionNames.includes(getterName)) {
    return `\`getter_name\` "${getterName}" is not an "Expression" or "ExpressionAndCondition" of this scope: an "ActionWithOperator" changes the value that function reads. Available getters: ${listQuoted(
      expressionNames
    )}.`;
  }
  return null;
};

const makeWillDeleteFunctionChanges = (
  resolvedScope: ResolvedScope,
  extensionName: string,
  functionName: string
): WillDeleteExtensionItemChanges => {
  const { eventsBasedBehavior, eventsBasedObject } = resolvedScope;
  if (eventsBasedBehavior) {
    return {
      kind: 'function',
      extensionName,
      behaviorName: eventsBasedBehavior.getName(),
      functionName,
    };
  }
  if (eventsBasedObject) {
    return {
      kind: 'function',
      extensionName,
      objectName: eventsBasedObject.getName(),
      functionName,
    };
  }
  return { kind: 'function', extensionName, functionName };
};

const makeFunctionRenamedChanges = (
  resolvedScope: ResolvedScope,
  extensionName: string,
  oldName: string,
  newName: string
): ProjectItemRenamedOutsideEditorChanges => {
  const { eventsBasedBehavior, eventsBasedObject } = resolvedScope;
  if (eventsBasedBehavior) {
    return {
      kind: 'function',
      oldName,
      newName,
      extensionName,
      behaviorName: eventsBasedBehavior.getName(),
    };
  }
  if (eventsBasedObject) {
    return {
      kind: 'function',
      oldName,
      newName,
      extensionName,
      objectName: eventsBasedObject.getName(),
    };
  }
  return { kind: 'function', oldName, newName, extensionName };
};

/**
 * The refactorers only follow the getter of an `ActionWithOperator` when it is
 * an `ExpressionAndCondition`: a plain `Expression` can be one too.
 */
const renameGetterOfSiblingFunctions = (
  functionsContainer: gdEventsFunctionsContainer,
  oldName: string,
  newName: string
) => {
  for (
    let index = 0;
    index < functionsContainer.getEventsFunctionsCount();
    index++
  ) {
    const siblingFunction = functionsContainer.getEventsFunctionAt(index);
    if (siblingFunction.getGetterName() === oldName)
      siblingFunction.setGetterName(newName);
  }
};

const renameFunctionInProject = (
  project: gdProject,
  resolvedScope: ResolvedScope,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  functionsContainer: gdEventsFunctionsContainer,
  oldName: string,
  newName: string
) => {
  const { eventsBasedBehavior, eventsBasedObject } = resolvedScope;
  if (eventsBasedBehavior) {
    gd.WholeProjectRefactorer.renameBehaviorEventsFunction(
      project,
      eventsFunctionsExtension,
      eventsBasedBehavior,
      oldName,
      newName
    );
  } else if (eventsBasedObject) {
    gd.WholeProjectRefactorer.renameObjectEventsFunction(
      project,
      eventsFunctionsExtension,
      eventsBasedObject,
      oldName,
      newName
    );
  } else {
    gd.WholeProjectRefactorer.renameEventsFunction(
      project,
      eventsFunctionsExtension,
      oldName,
      newName
    );
  }
  renameGetterOfSiblingFunctions(functionsContainer, oldName, newName);
};

// The names of the scope, for the chat rendering (the arguments may be anything).
const getScopeNamesFromArgs = (
  args: any
): {|
  extensionName: string,
  behaviorName: string | null,
  objectName: string | null,
|} => {
  const scope = SafeExtractor.extractObjectProperty(args, 'scope');
  return {
    extensionName:
      SafeExtractor.extractStringProperty(scope, 'extension_name') || '',
    behaviorName: SafeExtractor.extractStringProperty(
      scope,
      'custom_behavior_name'
    ),
    objectName: SafeExtractor.extractStringProperty(
      scope,
      'custom_object_name'
    ),
  };
};

const renderFunctionLink = (
  args: any,
  functionName: string,
  editorCallbacks: {
    onOpenEventsFunctionsExtension: (
      extensionName: string,
      options: {|
        functionName?: string,
        behaviorName?: string,
        objectName?: string,
      |}
    ) => void,
    ...
  }
): React.Node => {
  const { extensionName, behaviorName, objectName } = getScopeNamesFromArgs(
    args
  );
  const openOptions: {|
    functionName?: string,
    behaviorName?: string,
    objectName?: string,
  |} = behaviorName
    ? { functionName, behaviorName }
    : objectName
    ? { functionName, objectName }
    : { functionName };
  return (
    <Link
      href="#"
      onClick={() =>
        editorCallbacks.onOpenEventsFunctionsExtension(
          extensionName,
          openOptions
        )
      }
    >
      {functionName}
    </Link>
  );
};

// ---------------------------------------------------------------------------
// create_custom_function
// ---------------------------------------------------------------------------

export const createCustomFunction: EditorFunction = {
  renderForEditor: ({ args, editorCallbacks }) => {
    const function_name = extractRequiredString(args, 'function_name');
    const { extensionName } = getScopeNamesFromArgs(args);

    return {
      text: (
        <Trans>
          Create the function{' '}
          {renderFunctionLink(args, function_name, editorCallbacks)} in
          extension {extensionName}.
        </Trans>
      ),
    };
  },
  launchFunction: async ({
    project,
    args,
    onExtensionsModifiedOutsideEditor,
    reloadExtensionMetadata,
  }): Promise<EditorFunctionGenericOutput> => {
    const containerResult = resolveFunctionsContainerOfCall(project, args);
    if (!containerResult.success)
      return makeGenericFailure(containerResult.message);
    const {
      resolvedScope,
      eventsFunctionsExtension,
      functionsContainer,
      owner,
    } = containerResult;
    const extensionName = eventsFunctionsExtension.getName();

    const requestedFunctionName = extractRequiredString(args, 'function_name');
    const duplicatedFunctionName = SafeExtractor.extractStringProperty(
      args,
      'duplicated_function_name'
    );
    const rawFunctionType = args ? args.function_type : undefined;
    let functionTypeName = null;
    if (rawFunctionType !== undefined && rawFunctionType !== null) {
      const parsedFunctionType = getEnumSettingValue(
        rawFunctionType,
        FUNCTION_TYPES,
        'function_type'
      );
      if (!parsedFunctionType.success)
        return makeGenericFailure(parsedFunctionType.message);
      functionTypeName = parsedFunctionType.value;
    }
    const parameterSpecs: Array<ParameterSpec> =
      (SafeExtractor.extractArrayProperty(args, 'parameters'): any) || [];

    const functionName = gd.Project.getSafeName(requestedFunctionName);
    // A duplicated function brings the type and declared parameters of its source.
    if (
      duplicatedFunctionName &&
      !functionsContainer.hasEventsFunctionNamed(duplicatedFunctionName)
    ) {
      return makeGenericFailure(
        `Function "${duplicatedFunctionName}" not found in ${
          resolvedScope.label
        }: it cannot be copied (a function is always copied inside its own extension, behavior or custom object). Existing functions: ${listQuoted(
          getFunctionNames(functionsContainer)
        )}.`
      );
    }
    const duplicatedFunction = duplicatedFunctionName
      ? functionsContainer.getEventsFunction(duplicatedFunctionName)
      : null;
    const duplicatedParametersCount = duplicatedFunction
      ? Math.max(
          0,
          duplicatedFunction.getParameters().getParametersCount() -
            getImplicitParametersCount(owner)
        )
      : 0;
    // A new function is an Action unless the call (or its source) says otherwise.
    const createdFunctionTypeName =
      functionTypeName ||
      (duplicatedFunction ? getFunctionTypeName(duplicatedFunction) : 'Action');
    const parsedExpressionType = readExpressionType(
      args,
      createdFunctionTypeName
    );
    if (!parsedExpressionType.success)
      return makeGenericFailure(parsedExpressionType.message);
    const lifecycleRejection = getLifecycleRejection({
      functionName,
      owner,
      scopeLabel: resolvedScope.label,
      functionTypeName,
      parametersCount: parameterSpecs.length + duplicatedParametersCount,
    });
    if (lifecycleRejection) return makeGenericFailure(lifecycleRejection);
    if (functionsContainer.hasEventsFunctionNamed(functionName)) {
      return makeGenericFailure(
        `Function "${functionName}" already exists in ${
          resolvedScope.label
        }. Pass another \`function_name\`, or change the existing one with change_custom_function. Existing functions: ${listQuoted(
          getFunctionNames(functionsContainer)
        )}.`
      );
    }

    const parsedIsPrivate = readOptionalBoolean(args, 'is_private');
    if (!parsedIsPrivate.success)
      return makeGenericFailure(parsedIsPrivate.message);
    const parsedIsAsync = readOptionalBoolean(args, 'is_async');
    if (!parsedIsAsync.success)
      return makeGenericFailure(parsedIsAsync.message);

    const getterName = SafeExtractor.extractStringProperty(args, 'getter_name');
    if (functionTypeName === 'ActionWithOperator') {
      const getterRejection = getGetterRejection(
        functionsContainer,
        getterName
      );
      if (getterRejection) return makeGenericFailure(getterRejection);
    }

    const messages = [];
    const renameNotice = renamedMessage(requestedFunctionName, functionName);
    if (renameNotice) messages.push(renameNotice);

    let eventsFunction;
    if (duplicatedFunction) {
      const clonedFunction = duplicatedFunction.clone();
      eventsFunction = functionsContainer.insertEventsFunction(
        clonedFunction,
        functionsContainer.getEventsFunctionsCount()
      );
      clonedFunction.delete();
      eventsFunction.setName(functionName);
      messages.push(
        `Copied "${duplicatedFunction.getName()}" with its parameters and events.`
      );
    } else {
      eventsFunction = functionsContainer.insertNewEventsFunction(
        functionName,
        functionsContainer.getEventsFunctionsCount()
      );
    }

    if (functionTypeName !== null) {
      setFunctionTypeName(eventsFunction, functionTypeName);
    }
    if (parsedExpressionType.value !== null) {
      setExpressionType(project, eventsFunction, parsedExpressionType.value);
    }
    const fullName = SafeExtractor.extractStringProperty(args, 'full_name');
    if (fullName !== null) eventsFunction.setFullName(fullName);
    const description = SafeExtractor.extractStringProperty(
      args,
      'description'
    );
    if (description !== null) eventsFunction.setDescription(description);
    const group = SafeExtractor.extractStringProperty(args, 'group');
    if (group !== null) eventsFunction.setGroup(group);
    if (getterName !== null) eventsFunction.setGetterName(getterName);
    if (parsedIsPrivate.value !== null)
      eventsFunction.setPrivate(parsedIsPrivate.value);
    if (parsedIsAsync.value !== null)
      eventsFunction.setAsync(parsedIsAsync.value);

    // The implicit `Object` and `Behavior` parameters are written over the
    // first parameters of every function: they must exist before the ones of
    // the call are added.
    ensureProperParameters(resolvedScope);
    if (parameterSpecs.length > 0) {
      const parametersResult = applyParameterSpecs(
        eventsFunction,
        parameterSpecs
      );
      if (!parametersResult.success) {
        functionsContainer.removeEventsFunction(functionName);
        return makeGenericFailure(parametersResult.message);
      }
      messages.push(...parametersResult.messages);
    }

    const finalFunctionTypeName = getFunctionTypeName(eventsFunction);
    const sentence = SafeExtractor.extractStringProperty(args, 'sentence');
    if (sentence !== null) {
      eventsFunction.setSentence(sentence);
    } else if (
      hasSentence(finalFunctionTypeName) &&
      !eventsFunction.getSentence() &&
      // A lifecycle function is called by GDevelop, never shown in a sheet.
      !isLifecycleFunctionName(owner, functionName)
    ) {
      eventsFunction.setSentence(getDefaultSentence(eventsFunction, owner));
      messages.push(
        `Sentence shown in the events sheet: "${eventsFunction.getSentence()}" (pass \`sentence\` to write your own).`
      );
    }
    generateFunctionSkeleton(project, eventsFunction);

    onExtensionsModifiedOutsideEditor({
      extensionNames: [extensionName],
      needsCodeRegeneration: true,
    });
    // The call forms are read from the generated metadata when the editor has
    // it: refresh it so it describes the function that was just written (the
    // code is only regenerated by the flush at the end of the batch).
    reloadExtensionMetadata(extensionName);
    const callForms = getCallForms(
      resolvedScope,
      functionsContainer,
      eventsFunction
    );

    return {
      success: true,
      message: [
        `Created the ${finalFunctionTypeName} "${functionName}" in ${
          resolvedScope.label
        }.`,
        ...messages,
        callForms.length > 0
          ? `Call it from EventScript with: ${callForms.join(' | ')}.`
          : 'GDevelop calls it by itself: write its events with generate_events.',
      ].join(' '),
      extensionName,
      functionName,
      functionType: finalFunctionTypeName,
      callForms,
    };
  },
  modifiesProject: true,
};

// ---------------------------------------------------------------------------
// change_custom_function
// ---------------------------------------------------------------------------

// A setting checked against the function: `apply` returns what changed, or
// null when the function already had this value.
type PlannedFunctionSetting = {|
  settingName: string,
  apply: () => string | null,
|};

const planFunctionSettings = ({
  project,
  eventsFunction,
  functionsContainer,
  changedSettings,
}: {|
  project: gdProject,
  eventsFunction: gdEventsFunction,
  functionsContainer: gdEventsFunctionsContainer,
  changedSettings: Array<any>,
|}):
  | {|
      success: true,
      plannedSettings: Array<PlannedFunctionSetting>,
      finalFunctionTypeName: string,
      finalGetterName: string,
    |}
  | {| success: false, message: string |} => {
  const plannedSettings: Array<PlannedFunctionSetting> = [];
  let finalFunctionTypeName = getFunctionTypeName(eventsFunction);
  let finalGetterName = eventsFunction.getGetterName();

  for (const changedSetting of changedSettings) {
    const settingName = SafeExtractor.extractStringProperty(
      changedSetting,
      'setting_name'
    );
    if (!settingName || !FUNCTION_SETTING_NAMES.includes(settingName)) {
      return {
        success: false,
        message: `Setting "${settingName ||
          ''}" does not exist on a function. Settings you can change: ${listQuoted(
          FUNCTION_SETTING_NAMES
        )} (parameters are changed with \`changed_parameters\`).`,
      };
    }
    const newValue = changedSetting ? changedSetting.new_value : undefined;

    if (
      settingName === 'isPrivate' ||
      settingName === 'isAsync' ||
      settingName === 'isDeprecated'
    ) {
      const parsedValue = parseBoolean(newValue, settingName);
      if (!parsedValue.success)
        return { success: false, message: parsedValue.message };
      const booleanValue = parsedValue.value;
      plannedSettings.push({
        settingName,
        apply: () => {
          const currentValue =
            settingName === 'isPrivate'
              ? eventsFunction.isPrivate()
              : settingName === 'isAsync'
              ? eventsFunction.isAsync()
              : eventsFunction.isDeprecated();
          if (currentValue === booleanValue) return null;
          if (settingName === 'isPrivate')
            eventsFunction.setPrivate(booleanValue);
          else if (settingName === 'isAsync')
            eventsFunction.setAsync(booleanValue);
          else eventsFunction.setDeprecated(booleanValue);
          return `${settingName} set to ${String(booleanValue)}`;
        },
      });
      continue;
    }

    if (settingName === 'functionType') {
      const parsedValue = getEnumSettingValue(
        newValue,
        FUNCTION_TYPES,
        settingName
      );
      if (!parsedValue.success)
        return { success: false, message: parsedValue.message };
      const functionTypeName = parsedValue.value;
      finalFunctionTypeName = functionTypeName;
      plannedSettings.push({
        settingName,
        apply: () => {
          if (getFunctionTypeName(eventsFunction) === functionTypeName)
            return null;
          setFunctionTypeName(eventsFunction, functionTypeName);
          if (eventsFunction.isExpression()) {
            // The events returning a value must return the new type.
            gd.PropertyFunctionGenerator.updateReturnActionType(
              project,
              eventsFunction
            );
          }
          return `functionType set to "${functionTypeName}"`;
        },
      });
      continue;
    }

    if (settingName === 'expressionType') {
      const parsedValue = getEnumSettingValue(
        normalizeExpressionType(newValue),
        EXPRESSION_TYPES,
        settingName
      );
      if (!parsedValue.success)
        return { success: false, message: parsedValue.message };
      const expressionType = parsedValue.value;
      plannedSettings.push({
        settingName,
        apply: () => {
          if (getExpressionTypeName(eventsFunction) === expressionType)
            return null;
          setExpressionType(project, eventsFunction, expressionType);
          return `expressionType set to "${expressionType}"`;
        },
      });
      continue;
    }

    if (typeof newValue !== 'string') {
      return {
        success: false,
        message: `\`new_value\` of "${settingName}" must be a string (use "" to clear it).`,
      };
    }
    const stringValue = newValue;
    if (settingName === 'getterName') finalGetterName = stringValue;
    plannedSettings.push({
      settingName,
      apply: () => {
        const currentValue =
          settingName === 'fullName'
            ? eventsFunction.getFullName()
            : settingName === 'description'
            ? eventsFunction.getDescription()
            : settingName === 'sentence'
            ? eventsFunction.getSentence()
            : settingName === 'group'
            ? eventsFunction.getGroup()
            : settingName === 'getterName'
            ? eventsFunction.getGetterName()
            : settingName === 'helpUrl'
            ? eventsFunction.getHelpUrl()
            : eventsFunction.getDeprecationMessage();
        if (currentValue === stringValue) return null;
        if (settingName === 'fullName') eventsFunction.setFullName(stringValue);
        else if (settingName === 'description')
          eventsFunction.setDescription(stringValue);
        else if (settingName === 'sentence')
          eventsFunction.setSentence(stringValue);
        else if (settingName === 'group') eventsFunction.setGroup(stringValue);
        else if (settingName === 'getterName')
          eventsFunction.setGetterName(stringValue);
        else if (settingName === 'helpUrl')
          eventsFunction.setHelpUrl(stringValue);
        else eventsFunction.setDeprecationMessage(stringValue);
        return `${settingName} set to "${stringValue}"`;
      },
    });
  }

  if (finalFunctionTypeName === 'ActionWithOperator') {
    const getterRejection = getGetterRejection(
      functionsContainer,
      finalGetterName || null
    );
    if (getterRejection) return { success: false, message: getterRejection };
  }
  const hasExpressionTypeSetting = plannedSettings.some(
    plannedSetting => plannedSetting.settingName === 'expressionType'
  );
  if (
    hasExpressionTypeSetting &&
    !EXPRESSION_FUNCTION_TYPES.includes(finalFunctionTypeName)
  ) {
    return {
      success: false,
      message: `"expressionType" says what a function returns, and a "${finalFunctionTypeName}" returns nothing. Only ${listQuoted(
        EXPRESSION_FUNCTION_TYPES
      )} return a value: change \`functionType\` too, or drop "expressionType".`,
    };
  }
  return {
    success: true,
    // Changing `functionType` resets what an expression returns: whatever the
    // order of the call, `expressionType` is applied after it.
    plannedSettings: [
      ...plannedSettings.filter(
        plannedSetting => plannedSetting.settingName !== 'expressionType'
      ),
      ...plannedSettings.filter(
        plannedSetting => plannedSetting.settingName === 'expressionType'
      ),
    ],
    finalFunctionTypeName,
    finalGetterName,
  };
};

export const changeCustomFunction: EditorFunction = {
  renderForEditor: ({ args, editorCallbacks }) => {
    const function_name = extractRequiredString(args, 'function_name');
    const { extensionName } = getScopeNamesFromArgs(args);
    const isDeleted = !!SafeExtractor.extractBooleanProperty(
      args,
      'delete_this_function'
    );

    return {
      text: isDeleted ? (
        <Trans>
          Delete the function <b>{function_name}</b> of extension{' '}
          {extensionName}.
        </Trans>
      ) : (
        <Trans>
          Update the function{' '}
          {renderFunctionLink(args, function_name, editorCallbacks)} of
          extension {extensionName}.
        </Trans>
      ),
    };
  },
  launchFunction: async ({
    project,
    args,
    onExtensionsModifiedOutsideEditor,
    onProjectItemRenamedOutsideEditor,
    onWillDeleteExtensionItem,
    reloadExtensionMetadata,
  }): Promise<EditorFunctionGenericOutput> => {
    const containerResult = resolveFunctionsContainerOfCall(project, args);
    if (!containerResult.success)
      return makeGenericFailure(containerResult.message);
    const {
      resolvedScope,
      eventsFunctionsExtension,
      functionsContainer,
      owner,
    } = containerResult;
    const extensionName = eventsFunctionsExtension.getName();
    const functionName = extractRequiredString(args, 'function_name');

    if (!functionsContainer.hasEventsFunctionNamed(functionName)) {
      return makeGenericFailure(
        `Function "${functionName}" not found in ${
          resolvedScope.label
        }. Existing functions: ${listQuoted(
          getFunctionNames(functionsContainer)
        )}. Pass \`function_name\` of an existing function, or create it with create_custom_function.`
      );
    }
    const eventsFunction = functionsContainer.getEventsFunction(functionName);

    if (SafeExtractor.extractBooleanProperty(args, 'delete_this_function')) {
      await onWillDeleteExtensionItem(
        makeWillDeleteFunctionChanges(
          resolvedScope,
          extensionName,
          functionName
        )
      );
      functionsContainer.removeEventsFunction(functionName);
      onExtensionsModifiedOutsideEditor({
        extensionNames: [extensionName],
        needsCodeRegeneration: true,
      });
      return {
        success: true,
        message: `Deleted the function "${functionName}" of ${
          resolvedScope.label
        }. The events calling it are now invalid: update them, or create the function again.`,
        extensionName,
        functionName,
        callForms: [],
      };
    }

    // Everything is checked before anything is applied: a refused change never
    // leaves the function half-changed.
    const changedSettings =
      SafeExtractor.extractArrayProperty(args, 'changed_settings') || [];
    const plannedSettingsResult = planFunctionSettings({
      project,
      eventsFunction,
      functionsContainer,
      changedSettings,
    });
    if (!plannedSettingsResult.success)
      return makeGenericFailure(plannedSettingsResult.message);
    const { finalFunctionTypeName, finalGetterName } = plannedSettingsResult;

    const changedParameters: Array<ParameterChange> =
      (SafeExtractor.extractArrayProperty(args, 'changed_parameters'): any) ||
      [];
    if (
      changedParameters.length > 0 &&
      finalFunctionTypeName === 'ActionWithOperator'
    ) {
      return makeGenericFailure(
        `"${functionName}" is an "ActionWithOperator": it declares no parameter, GDevelop builds them from its getter${
          finalGetterName ? ` "${finalGetterName}"` : ''
        } (the parameters of the getter, plus the "Value" being set). Change the parameters of the getter${
          finalGetterName ? ` ("${finalGetterName}")` : ''
        } instead, or read another one with \`changed_settings\` "getterName".`
      );
    }
    let plannedParameterChanges: PlannedParameterChanges | null = null;
    if (changedParameters.length > 0) {
      const plannedParametersResult = planParameterChanges({
        resolvedScope,
        eventsFunction,
        changes: changedParameters,
      });
      if (!plannedParametersResult.success)
        return makeGenericFailure(plannedParametersResult.message);
      plannedParameterChanges = plannedParametersResult.plannedChanges;
    }

    const newName = getRequestedNewName(args, functionName);
    let finalFunctionName = functionName;
    if (newName !== null) {
      if (isLifecycleFunctionName(owner, functionName)) {
        return makeGenericFailure(
          `"${functionName}" is a lifecycle function: GDevelop calls it under this exact name, so it cannot be renamed. Create another function and call it from "${functionName}", or delete "${functionName}".`
        );
      }
      finalFunctionName = gd.Project.getSafeName(newName);
      if (functionsContainer.hasEventsFunctionNamed(finalFunctionName)) {
        return makeGenericFailure(
          `Name "${finalFunctionName}" is already used by another function of ${
            resolvedScope.label
          }. Existing functions: ${listQuoted(
            getFunctionNames(functionsContainer)
          )}. Pass a free name in \`new_name\`.`
        );
      }
    }

    // The declaration the call ends up with must stay one GDevelop can call: a
    // lifecycle function keeps its name, its Action type and no parameter.
    const isRenamed = finalFunctionName !== functionName;
    const lifecycleRejection =
      isRenamed || isLifecycleFunctionName(owner, finalFunctionName)
        ? getLifecycleRejection({
            functionName: finalFunctionName,
            owner,
            scopeLabel: resolvedScope.label,
            functionTypeName: finalFunctionTypeName,
            // Only the declared parameters count: the implicit ones stay.
            parametersCount: plannedParameterChanges
              ? getPlannedUserParametersCount(plannedParameterChanges)
              : Math.max(
                  0,
                  eventsFunction.getParameters().getParametersCount() -
                    getImplicitParametersCount(owner)
                ),
            typeField: '`functionType`',
            parametersField: '`changed_parameters`',
          })
        : null;
    if (lifecycleRejection) return makeGenericFailure(lifecycleRejection);

    const messages: Array<string> = [];
    let changedCount = 0;
    let needsCodeRegeneration = false;

    for (const plannedSetting of plannedSettingsResult.plannedSettings) {
      const detail = plannedSetting.apply();
      if (!detail) continue;
      changedCount++;
      messages.push(`${detail}.`);
      if (!METADATA_ONLY_SETTING_NAMES.includes(plannedSetting.settingName)) {
        needsCodeRegeneration = true;
      }
    }

    if (plannedParameterChanges) {
      const { accessor, dispose } = makeScopeProjectScopedContainersAccessor(
        project,
        resolvedScope,
        eventsFunction
      );
      try {
        const parametersResult = applyPlannedParameterChanges({
          project,
          resolvedScope,
          eventsFunction,
          accessor,
          plannedChanges: plannedParameterChanges,
        });
        if (!parametersResult.success)
          return makeGenericFailure(parametersResult.message);
        changedCount += parametersResult.changedCount;
        messages.push(...parametersResult.messages);
        if (parametersResult.changedCount > 0) needsCodeRegeneration = true;
      } finally {
        dispose();
      }
    }

    if (isRenamed) {
      renameFunctionInProject(
        project,
        resolvedScope,
        eventsFunctionsExtension,
        functionsContainer,
        functionName,
        finalFunctionName
      );
      eventsFunction.setName(finalFunctionName);
      changedCount++;
      needsCodeRegeneration = true;
      messages.push(
        `Renamed to "${finalFunctionName}": the events calling it were updated.`
      );
      const renameNotice = renamedMessage(
        newName || finalFunctionName,
        finalFunctionName
      );
      if (renameNotice) messages.push(renameNotice);
      onProjectItemRenamedOutsideEditor(
        makeFunctionRenamedChanges(
          resolvedScope,
          extensionName,
          functionName,
          finalFunctionName
        )
      );
    }

    if (changedCount === 0) {
      return {
        success: true,
        message: [
          `Nothing changed on the function "${functionName}" of ${
            resolvedScope.label
          }: it already had these values.`,
          ...messages,
          'Pass `changed_settings`, `changed_parameters`, `new_name` or `delete_this_function` to change something.',
        ].join(' '),
        extensionName,
        functionName,
        callForms: getCallForms(
          resolvedScope,
          functionsContainer,
          eventsFunction
        ),
        nothingChanged: true,
      };
    }

    onExtensionsModifiedOutsideEditor({
      extensionNames: [extensionName],
      needsCodeRegeneration,
    });
    // The call forms are read from the generated metadata when the editor has
    // it: refresh it so it describes the function as it is now (the code is
    // only regenerated by the flush at the end of the batch).
    reloadExtensionMetadata(extensionName);
    const callForms = getCallForms(
      resolvedScope,
      functionsContainer,
      eventsFunction
    );

    return {
      success: true,
      message: [
        `Function "${finalFunctionName}" of ${resolvedScope.label}:`,
        ...messages,
        callForms.length > 0
          ? `Call it from EventScript with: ${callForms.join(' | ')}.`
          : '',
      ]
        .filter(Boolean)
        .join(' '),
      extensionName,
      functionName: finalFunctionName,
      callForms,
    };
  },
  modifiesProject: true,
};
