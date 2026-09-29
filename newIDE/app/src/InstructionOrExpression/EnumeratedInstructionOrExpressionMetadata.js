//@flow
import { type EventsScope } from './EventsScope';
const gd: libGDevelop = global.gd;

export type InstructionOrExpressionScope = {|
  extension: {
    name: string,
  },
  objectMetadata?: ?{
    name: string,
    isPrivate: boolean,
  },
  behaviorMetadata?: ?{
    name: string,
    isPrivate: boolean,
  },
|};

export type EnumeratedInstructionMetadata = {|
  type: string,
  displayedName: string,
  description: string,
  fullGroupName: string,
  iconFilename: string,
  scope: InstructionOrExpressionScope,
  isPrivate: boolean,
  isRelevantForLayoutEvents: boolean,
  isRelevantForFunctionEvents: boolean,
  isRelevantForAsynchronousFunctionEvents: boolean,
  isRelevantForCustomObjectEvents: boolean,

  // TODO: remove this reference. While it's useful, it's also a risk
  // to have the editor to keep a reference to a gdInstructionMetadata
  // that would have been removed/replaced in memory (for example, when
  // expressions are updated). Instead, we should add fields to store
  // whatever is needed (in JavaScript, so it's safe).
  metadata: gdInstructionMetadata,
|};

export type EnumeratedExpressionMetadata = {|
  type: string,
  displayedName: string,
  fullGroupName: string,
  iconFilename: string,
  metadata: gdExpressionMetadata,
  scope: InstructionOrExpressionScope,
  isPrivate: boolean,
  isRelevantForLayoutEvents: boolean,
  isRelevantForFunctionEvents: boolean,
  isRelevantForAsynchronousFunctionEvents: boolean,
  isRelevantForCustomObjectEvents: boolean,
  name: string,
  /** Represents only the visible parameters in the parentheses of the expression. */
  parameters: Array<gdParameterMetadata>,
|};

// An object representing InstructionMetadata or ExpressionMetadata.
// Allow to use most information without paying the cost to call the
// InstructionMetadata/ExpressionMetadata methods. In theory,
// this type and objects are redundant with InstructionMetadata and ExpressionMetadata.
export type EnumeratedInstructionOrExpressionMetadata =
  | EnumeratedInstructionMetadata
  | EnumeratedExpressionMetadata;

/**
 * Given a list of expression or instructions that were previously enumerated,
 * filter the ones that are not usable from the current "scope".
 */
export const filterEnumeratedInstructionOrExpressionMetadataByScope = <
  // $FlowFixMe[unsupported-variance-annotation]
  +T: EnumeratedInstructionOrExpressionMetadata
>(
  list: Array<T>,
  scope: EventsScope
): Array<T> => {
  return list.filter(enumeratedInstructionOrExpressionMetadata =>
    isFunctionVisibleInGivenScope(
      enumeratedInstructionOrExpressionMetadata,
      scope
    )
  );
};

/**
 * Where events are being authored, identified by names: the extension being
 * edited and, when the events are those of a function owned by a custom behavior
 * or a custom object, this owner. Null when authoring outside of any extension
 * (a scene, an external events sheet).
 */
export type FunctionAuthoringScope = {|
  extensionName: string,
  customBehaviorName?: ?string,
  customObjectName?: ?string,
|};

/**
 * Where a function (an instruction or an expression) is declared, and whether it
 * is private.
 */
export type FunctionDeclarationScope = {|
  extensionName: string,
  isPrivate: boolean,
  // The full type ("Extension::Name") of the custom behavior or object owning
  // the function, with whether this owner itself is private.
  behaviorMetadata: ?{ name: string, isPrivate: boolean },
  objectMetadata: ?{ name: string, isPrivate: boolean },
|};

/**
 * Whether a function can be called from the given authoring scope. A private
 * function is only callable where it is declared: a free function anywhere in its
 * extension, a method of a custom behavior or object only while authoring this
 * very behavior or object. The public functions of a private behavior or object
 * stay callable within their extension.
 */
export const isFunctionCallableInAuthoringScope = (
  {
    extensionName,
    isPrivate,
    behaviorMetadata,
    objectMetadata,
  }: FunctionDeclarationScope,
  authoringScope: ?FunctionAuthoringScope
): boolean => {
  return !!(
    (!isPrivate &&
      (!behaviorMetadata || !behaviorMetadata.isPrivate) &&
      (!objectMetadata || !objectMetadata.isPrivate)) ||
    // The instruction or expression is marked as "private":
    // we now compare its scope (where it was declared) and the current scope
    // (where we are) to see if we should filter it or not.

    // Show private behavior functions when editing the behavior
    (behaviorMetadata &&
      authoringScope &&
      authoringScope.customBehaviorName &&
      gd.PlatformExtension.getBehaviorFullType(
        authoringScope.extensionName,
        authoringScope.customBehaviorName
      ) === behaviorMetadata.name) ||
    (objectMetadata &&
      authoringScope &&
      authoringScope.customObjectName &&
      gd.PlatformExtension.getObjectFullType(
        authoringScope.extensionName,
        authoringScope.customObjectName
      ) === objectMetadata.name) ||
    // When editing the extension...
    (authoringScope &&
      authoringScope.extensionName === extensionName &&
      // ...show public functions of a private behavior
      (!isPrivate ||
        // ...show private non-behavior functions
        (!behaviorMetadata && !objectMetadata)))
  );
};

/**
 * The authoring scope of events being edited, as named in `EventsScope`.
 */
export const getFunctionAuthoringScope = (
  scope: EventsScope
): FunctionAuthoringScope | null => {
  const {
    eventsBasedBehavior,
    eventsBasedObject,
    eventsFunctionsExtension,
  } = scope;
  if (!eventsFunctionsExtension) return null;

  return {
    extensionName: eventsFunctionsExtension.getName(),
    customBehaviorName: eventsBasedBehavior
      ? eventsBasedBehavior.getName()
      : null,
    customObjectName: eventsBasedObject ? eventsBasedObject.getName() : null,
  };
};

const isFunctionVisibleInGivenScope = (
  enumeratedInstructionOrExpressionMetadata: EnumeratedInstructionOrExpressionMetadata,
  scope: EventsScope
): boolean => {
  const {
    behaviorMetadata,
    objectMetadata,
    extension,
  } = enumeratedInstructionOrExpressionMetadata.scope;

  return !!(
    ((enumeratedInstructionOrExpressionMetadata.isRelevantForLayoutEvents &&
      (scope.layout || scope.externalEvents)) ||
      (enumeratedInstructionOrExpressionMetadata.isRelevantForFunctionEvents &&
        scope.eventsFunction) ||
      (enumeratedInstructionOrExpressionMetadata.isRelevantForAsynchronousFunctionEvents &&
        scope.eventsFunction &&
        scope.eventsFunction.isAsync()) ||
      (enumeratedInstructionOrExpressionMetadata.isRelevantForCustomObjectEvents &&
        scope.eventsBasedObject)) &&
    // Check visibility.
    isFunctionCallableInAuthoringScope(
      {
        extensionName: extension.name,
        isPrivate: enumeratedInstructionOrExpressionMetadata.isPrivate,
        behaviorMetadata,
        objectMetadata,
      },
      getFunctionAuthoringScope(scope)
    )
  );
};
