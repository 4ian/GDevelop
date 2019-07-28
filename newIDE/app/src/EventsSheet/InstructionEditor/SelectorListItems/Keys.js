// @flow

// ListItem created must have consistent keys that include their type
// (object, group, instruction) to allow them to be living
// in the same list (in search results) and be selected.

export const getObjectOrObjectGroupListItemKey = (
  objectOrObjectGroupName: string
) => `object-or-object-group-${objectOrObjectGroupName}`;
export const getInstructionListItemKey = (instructionType: string) =>
  `instruction-${instructionType}`;
export const getSubheaderListItemKey = (subheader: string) =>
  `subheader-${subheader}`;
