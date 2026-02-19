// @flow
import type {
  GroupWithContext,
  ObjectWithContext,
} from '../../../ObjectsList/EnumerateObjects';
import { type EnumeratedInstructionOrExpressionMetadata } from '../../../InstructionOrExpression/EnumeratedInstructionOrExpressionMetadata';

const gd: libGDevelop = global.gd;

// ListItem created must have consistent keys that include their type
// (object, group, instruction) to allow them to be living
// in the same list (in search results) and be selected.

export const getObjectGroupListItemKey = (
  groupWithContext: GroupWithContext
): string =>
  `object-group-key-${groupWithContext.group.getName()}-${
    groupWithContext.global ? '-global' : ''
  }`;
export const getObjectListItemKey = (
  objectWithContext: ObjectWithContext
): string =>
  `object-key-${objectWithContext.object.getName()}-${
    objectWithContext.global ? '-global' : ''
  }`;
export const getObjectOrObjectGroupListItemValue = (
  objectOrObjectGroupName: string
): string => `object-or-object-group-value-${objectOrObjectGroupName}`;

export const getInstructionListItemKey = (
  instruction: EnumeratedInstructionOrExpressionMetadata
): string =>
  `instruction-key-${instruction.fullGroupName}${
    instruction.scope.objectMetadata
      ? '-' + instruction.scope.objectMetadata.name
      : ''
  }-${instruction.type}`;

export const getInstructionListItemValue = (instructionType: string): string =>
  `instruction-value-${getInstructionType(instructionType)}`;

export const getInstructionType = (instructionType: string): string => {
  const switchableVariableInstructionIdentifier = gd.VariableInstructionSwitcher.getSwitchableVariableInstructionIdentifier(
    instructionType
  );
  return switchableVariableInstructionIdentifier.length > 0
    ? switchableVariableInstructionIdentifier
    : instructionType;
};

export const getSubheaderListItemKey = (subheader: string): string =>
  `subheader-key-${subheader}`;

export const getInstructionOrExpressionIdentifier = (
  instructionOrExpressionMetadata: EnumeratedInstructionOrExpressionMetadata
): string =>
  `instruction-or-expression-${
    instructionOrExpressionMetadata.scope.objectMetadata
      ? instructionOrExpressionMetadata.scope.objectMetadata.name.replace(
          /:/g,
          '-'
        ) + '-'
      : ''
  }${instructionOrExpressionMetadata.type.replace(/:/g, '-')}`;
