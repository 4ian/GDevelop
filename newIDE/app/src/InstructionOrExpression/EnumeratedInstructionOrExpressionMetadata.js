//@flow
import { type EventsScope } from './EventsScope.flow';
const gd = global.gd;

export type InstructionOrExpressionScope = {|
  objectMetadata?: ?gdObjectMetadata,
  behaviorMetadata?: ?gdBehaviorMetadata,
|};

// An object representing InstructionMetadata or ExpressionMetadata.
// Allow to use most information without paying the cost to call the
// InstructionMetadata/ExpressionMetadata methods. In theory,
// this type and objects are redundant with InstructionMetadata and ExpressionMetadata.
export type EnumeratedInstructionOrExpressionMetadata = {|
  type: string,
  displayedName: string,
  fullGroupName: string,
  iconFilename: string,
  metadata: gdInstructionMetadata | gdExpressionMetadata,
  scope: InstructionOrExpressionScope,
  isPrivate: boolean,

  name?: string, // For expressions
  parameters?: Array<gdParameterMetadata>, // For expressions
|};

export const filterEnumeratedInstructionOrExpressionMetadataByScope = (
  list: Array<EnumeratedInstructionOrExpressionMetadata>,
  scope: EventsScope
): Array<EnumeratedInstructionOrExpressionMetadata> => {
  // This is copied from gd::WholeProjectRefactorer (see GetBehaviorFullType)
  // Could be factored into a single C++ function in gd::PlatformExtension?
  const separator = gd.PlatformExtension.getNamespaceSeparator();
  const getBehaviorFullType = (extensionName: string, behaviorName: string) => {
    return extensionName + separator + behaviorName;
  };

  return list.filter(enumeratedInstructionOrExpressionMetadata => {
    if (!enumeratedInstructionOrExpressionMetadata.isPrivate) return true;

    const {
      behaviorMetadata,
    } = enumeratedInstructionOrExpressionMetadata.scope;
    const { eventsBasedBehavior, eventsFunctionsExtension } = scope;

    if (
      behaviorMetadata &&
      eventsBasedBehavior &&
      eventsFunctionsExtension &&
      getBehaviorFullType(
        eventsFunctionsExtension.getName(),
        eventsBasedBehavior.getName()
      ) === behaviorMetadata.getName()
    ) {
      return true;
    }

    return false;
  });
};
