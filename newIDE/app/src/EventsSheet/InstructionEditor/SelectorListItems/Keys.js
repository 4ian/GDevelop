// @flow
import type {
  GroupWithContext,
  ObjectWithContext,
} from '../../../ObjectsList/EnumerateObjects';
import { type EnumeratedInstructionOrExpressionMetadata } from '../../../InstructionOrExpression/EnumeratedInstructionOrExpressionMetadata.js';

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
): string => `instruction-key-${instruction.fullGroupName}-${instruction.type}`;
export const getInstructionListItemValue = (instructionType: string): string =>
  `instruction-value-${instructionType}`;

export const getSubheaderListItemKey = (subheader: string): string =>
  `subheader-key-${subheader}`;
