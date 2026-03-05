// @flow

export const normalizeString = (str: string): string =>
  str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export type SearchFilterParams = {|
  searchInConditions?: boolean,
  searchInActions?: boolean,
  searchInEventStrings?: boolean,
  searchInInstructionNames?: boolean,
|};
