// @flow
import type {
  GroupWithContext,
  ObjectWithContext,
} from '../../../ObjectsList/EnumerateObjects';
import { type EnumeratedInstructionOrExpressionMetadata } from '../../../InstructionOrExpression/EnumeratedInstructionOrExpressionMetadata';

// ListItem created must have consistent keys that include their type
// (object, group, instruction) to allow them to be living
// in the same list (in search results) and be selected.

export const getObjectGroupListItemKey = (groupWithContext: GroupWithContext) =>
  `object-group-key-${groupWithContext.group.getName()}-${
    groupWithContext.global ? '-global' : ''
  }`;
export const getObjectListItemKey = (objectWithContext: ObjectWithContext) =>
  `object-key-${objectWithContext.object.getName()}-${
    objectWithContext.global ? '-global' : ''
  }`;
export const getObjectOrObjectGroupListItemValue = (
  objectOrObjectGroupName: string
) => `object-or-object-group-value-${objectOrObjectGroupName}`;

export const getInstructionListItemKey = (
  instruction: EnumeratedInstructionOrExpressionMetadata
) =>
  `instruction-key-${instruction.fullGroupName}${
    instruction.scope.objectMetadata
      ? '-' + instruction.scope.objectMetadata.getName()
      : ''
  }-${instruction.type}`;

export const getInstructionListItemValue = (instructionType: string) =>
  `instruction-value-${instructionType}`;

export const getSubheaderListItemKey = (subheader: string) =>
  `subheader-key-${subheader}`;

export const getInstructionOrExpressionIdentifier = (
  instructionOrExpressionMetadata: EnumeratedInstructionOrExpressionMetadata
): string =>
  `instruction-or-expression-${
    instructionOrExpressionMetadata.scope.objectMetadata
      ? instructionOrExpressionMetadata.scope.objectMetadata
          .getName()
          .replace(/:/g, '-') + '-'
      : ''
  }${instructionOrExpressionMetadata.type.replace(/:/g, '-')}`;
