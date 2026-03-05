// @flow
import type { SearchFilterParams } from '../../../Utils/Search';

import * as React from 'react';

type SearchFiltersState = {|
  matchCase: boolean,
  searchInEventSentences: boolean,
  includeStoreExtensions: boolean,
  ...Required<SearchFilterParams>,
|};

type FreezedSearchState = {|
  ...SearchFiltersState,
  searchText: string,
|};

type UseSearchFormReturn = {|
  search: string,
  setSearch: string => void,
  searchFiltersState: SearchFiltersState,
  setSearchFiltersState: (
    SearchFiltersState | (SearchFiltersState => SearchFiltersState)
  ) => void,
  freezedSearchState: FreezedSearchState,
  setFreezedSearchState: (
    FreezedSearchState | (FreezedSearchState => FreezedSearchState)
  ) => void,
  hasSearched: boolean,
  setHasSearched: boolean => void,
|};

export const useSearchForm = (): UseSearchFormReturn => {
  const [search, setSearch] = React.useState<string>('');
  const [searchFiltersState, setSearchFiltersState] = React.useState({
    matchCase: false,
    searchInConditions: true,
    searchInActions: true,
    searchInEventStrings: true,
    searchInEventSentences: true,
    searchInInstructionNames: false,
    includeStoreExtensions: false,
  });

  const [freezedSearchState, setFreezedSearchState] = React.useState({
    ...searchFiltersState,
    searchText: search,
  });
  const [hasSearched, setHasSearched] = React.useState(false);

  return {
    search,
    setSearch,
    searchFiltersState,
    setSearchFiltersState,
    freezedSearchState,
    setFreezedSearchState,
    hasSearched,
    setHasSearched,
  };
};
