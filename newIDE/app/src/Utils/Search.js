// @flow

import type { EventPath } from './EventPath';

export const normalizeString = (str: string): string =>
  str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export type SearchFilterParams = {|
  matchCase?: boolean,
  includeStoreExtensions?: boolean,
  searchInConditions?: boolean,
  searchInActions?: boolean,
  searchInEventStrings?: boolean,
  searchInInstructionNames?: boolean,
  searchInEventSentences?: boolean,
|};

export type LocationType = 'layout' | 'external-events' | 'extension';

export type NavigateToEventFromGlobalSearchParams = {|
  locationType: LocationType,
  name: string,
  eventPath: EventPath,
  highlightedEventPaths: Array<EventPath>,
  searchText: string,
  extensionName?: string,
  functionName?: string,
  behaviorName?: string,
  objectName?: string,
  searchFilterParams: SearchFilterParams,
|};
