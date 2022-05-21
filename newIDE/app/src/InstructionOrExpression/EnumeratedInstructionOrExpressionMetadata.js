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
  fullGroupName: string,
  iconFilename: string,
  metadata: gdInstructionMetadata,
  scope: InstructionOrExpressionScope,
  isPrivate: boolean,
|};

export type EnumeratedExpressionMetadata = {|
  type: string,
  displayedName: string,
  fullGroupName: string,
  iconFilename: string,
  metadata: gdExpressionMetadata,
  scope: InstructionOrExpressionScope,
  isPrivate: boolean,
  name: string,
  /** Represents only the visible parameters in the parentheses of the expression. */
  parameters: Array<gdParameterMetadata>,
|};

// This is copied from gd::WholeProjectRefactorer (see GetBehaviorFullType)
// Could be factored into a single C++ function in gd::PlatformExtension?
const getBehaviorFullType = (extensionName: string, behaviorName: string) => {
  const separator = gd.PlatformExtension.getNamespaceSeparator();
  return extensionName + separator + behaviorName;
};

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
  return list.filter((enumeratedInstructionOrExpressionMetadata) => {
    if (!enumeratedInstructionOrExpressionMetadata.isPrivate) return true;

    // The instruction or expression is marked as "private":
    // we now compare its scope (where it was declared) and the current scope
    // (where we are) to see if we should filter it or not.

    const { behaviorMetadata, extension } =
      enumeratedInstructionOrExpressionMetadata.scope;
    const { eventsBasedBehavior, eventsFunctionsExtension } = scope;

    // Show private behavior functions when editing the behavior
    if (
      behaviorMetadata &&
      eventsBasedBehavior &&
      eventsFunctionsExtension &&
      getBehaviorFullType(
        eventsFunctionsExtension.getName(),
        eventsBasedBehavior.getName()
      ) === behaviorMetadata.getName()
    )
      return true;

    // Show private non-behavior functions when editing the extension
    if (
      !behaviorMetadata &&
      eventsFunctionsExtension &&
      eventsFunctionsExtension.getName() === extension.getName()
    )
      return true;

    return false;
  });
};
