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

const isFunctionVisibleInGivenScope = (
  enumeratedInstructionOrExpressionMetadata: EnumeratedInstructionOrExpressionMetadata,
  scope: EventsScope
): boolean => {
  const {
    behaviorMetadata,
    objectMetadata,
    extension,
  } = enumeratedInstructionOrExpressionMetadata.scope;
  const {
    eventsBasedBehavior,
    eventsBasedObject,
    eventsFunctionsExtension,
  } = scope;

  return !!(
    ((enumeratedInstructionOrExpressionMetadata.isRelevantForLayoutEvents &&
      (scope.layout || scope.externalEvents)) ||
      (enumeratedInstructionOrExpressionMetadata.isRelevantForFunctionEvents &&
        scope.eventsFunction) ||
      (enumeratedInstructionOrExpressionMetadata.isRelevantForAsynchronousFunctionEvents &&
        scope.eventsFunction &&
        scope.eventsFunction.isAsync()) ||
      (enumeratedInstructionOrExpressionMetadata.isRelevantForCustomObjectEvents &&
        eventsBasedObject)) &&
    // Check visibility.
    ((!enumeratedInstructionOrExpressionMetadata.isPrivate &&
      (!behaviorMetadata || !behaviorMetadata.isPrivate) &&
      (!objectMetadata || !objectMetadata.isPrivate)) ||
      // The instruction or expression is marked as "private":
      // we now compare its scope (where it was declared) and the current scope
      // (where we are) to see if we should filter it or not.

      // Show private behavior functions when editing the behavior
      (behaviorMetadata &&
        eventsBasedBehavior &&
        eventsFunctionsExtension &&
        gd.PlatformExtension.getBehaviorFullType(
          eventsFunctionsExtension.getName(),
          eventsBasedBehavior.getName()
        ) === behaviorMetadata.name) ||
      (objectMetadata &&
        eventsBasedObject &&
        eventsFunctionsExtension &&
        gd.PlatformExtension.getObjectFullType(
          eventsFunctionsExtension.getName(),
          eventsBasedObject.getName()
        ) === objectMetadata.name) ||
      // When editing the extension...
      (eventsFunctionsExtension &&
        eventsFunctionsExtension.getName() === extension.name &&
        // ...show public functions of a private behavior
        (!enumeratedInstructionOrExpressionMetadata.isPrivate ||
          // ...show private non-behavior functions
          (!behaviorMetadata && !objectMetadata))))
  );
};
