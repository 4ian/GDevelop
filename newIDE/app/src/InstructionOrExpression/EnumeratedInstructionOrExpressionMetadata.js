//@flow
import { type EventsScope } from './EventsScope.flow';
const gd: libGDevelop = global.gd;

export type InstructionOrExpressionScope = {|
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

export const filterEnumeratedInstructionOrExpressionMetadataByScope = <
  +T: EnumeratedInstructionOrExpressionMetadata
>(
  list: Array<T>,
  scope: EventsScope
): Array<T> => {
  const separator = gd.PlatformExtension.getNamespaceSeparator();
  return list.filter(enumeratedInstructionOrExpressionMetadata => {
    if (!enumeratedInstructionOrExpressionMetadata.isPrivate) return true;

    const {
      type,
      scope: { behaviorMetadata },
    } = enumeratedInstructionOrExpressionMetadata;
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
      eventsFunctionsExtension.getName() === type.split(separator)[0]
    )
      return true;

    return false;
  });
};
