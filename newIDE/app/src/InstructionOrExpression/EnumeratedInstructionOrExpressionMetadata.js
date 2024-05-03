//@flow
import { type EventsScope } from './EventsScope.flow';
const gd: libGDevelop = global.gd;

export type InstructionOrExpressionScope = {|
  extension: gdPlatformExtension,
  objectMetadata?: ?gdObjectMetadata,
  behaviorMetadata?: ?gdBehaviorMetadata,
|};

export type EnumeratedInstructionMetadata = {|
  type: string,
  displayedName: string,
  description: string,
  fullGroupName: string,
  iconFilename: string,
  metadata: gdInstructionMetadata,
  scope: InstructionOrExpressionScope,
  isPrivate: boolean,
  isRelevantForLayoutEvents: boolean,
  isRelevantForFunctionEvents: boolean,
  isRelevantForAsynchronousFunctionEvents: boolean,
  isRelevantForCustomObjectEvents: boolean,
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
    extension,
  } = enumeratedInstructionOrExpressionMetadata.scope;
  const { eventsBasedBehavior, eventsFunctionsExtension } = scope;

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
    ((!enumeratedInstructionOrExpressionMetadata.isPrivate &&
      (!behaviorMetadata || !behaviorMetadata.isPrivate())) ||
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
        ) === behaviorMetadata.getName()) ||
      // When editing the extension...
      (eventsFunctionsExtension &&
        eventsFunctionsExtension.getName() === extension.getName() &&
        // ...show public functions of a private behavior
        (!enumeratedInstructionOrExpressionMetadata.isPrivate ||
          // ...show private non-behavior functions
          !behaviorMetadata)))
  );
};
