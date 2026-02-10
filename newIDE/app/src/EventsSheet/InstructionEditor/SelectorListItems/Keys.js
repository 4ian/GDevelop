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

// $FlowFixMe[signature-verification-failure]
export const getObjectGroupListItemKey = (groupWithContext: GroupWithContext) =>
  `object-group-key-${groupWithContext.group.getName()}-${
    groupWithContext.global ? '-global' : ''
  }`;
// $FlowFixMe[signature-verification-failure]
export const getObjectListItemKey = (objectWithContext: ObjectWithContext) =>
  `object-key-${objectWithContext.object.getName()}-${
    objectWithContext.global ? '-global' : ''
  }`;
export const getObjectOrObjectGroupListItemValue = (
  objectOrObjectGroupName: string
// $FlowFixMe[signature-verification-failure]
) => `object-or-object-group-value-${objectOrObjectGroupName}`;

export const getInstructionListItemKey = (
  instruction: EnumeratedInstructionOrExpressionMetadata
// $FlowFixMe[signature-verification-failure]
) =>
  `instruction-key-${instruction.fullGroupName}${
    instruction.scope.objectMetadata
      ? '-' + instruction.scope.objectMetadata.name
      : ''
  }-${instruction.type}`;

// $FlowFixMe[signature-verification-failure]
export const getInstructionListItemValue = (instructionType: string) =>
  `instruction-value-${getInstructionType(instructionType)}`;

// $FlowFixMe[signature-verification-failure]
export const getInstructionType = (instructionType: string) => {
  const switchableVariableInstructionIdentifier = gd.VariableInstructionSwitcher.getSwitchableVariableInstructionIdentifier(
    instructionType
  );
  return switchableVariableInstructionIdentifier.length > 0
    ? switchableVariableInstructionIdentifier
    : instructionType;
};

// $FlowFixMe[signature-verification-failure]
export const getSubheaderListItemKey = (subheader: string) =>
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
