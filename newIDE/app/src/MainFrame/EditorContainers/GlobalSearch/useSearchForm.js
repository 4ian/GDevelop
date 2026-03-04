// @flow
import * as React from 'react';

type CheckBoxesState = {|
  matchCase: boolean,
  searchInConditions: boolean,
  searchInActions: boolean,
  searchInEventStrings: boolean,
  searchInEventSentences: boolean,
  searchInInstructionNames: boolean,
  includeStoreExtensions: boolean,
|};

type FreezedSearchState = {|
  ...CheckBoxesState,
  searchText: string,
|};

type UseSearchFormReturn = {|
  search: string,
  setSearch: string => void,
  checkBoxesState: CheckBoxesState,
  setCheckBoxesState: (
    CheckBoxesState | (CheckBoxesState => CheckBoxesState)
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
  const [checkBoxesState, setCheckBoxesState] = React.useState({
    matchCase: false,
    searchInConditions: true,
    searchInActions: true,
    searchInEventStrings: true,
    searchInEventSentences: true,
    searchInInstructionNames: false,
    includeStoreExtensions: false,
  });

  const [freezedSearchState, setFreezedSearchState] = React.useState({
    ...checkBoxesState,
    searchText: search,
  });
  const [hasSearched, setHasSearched] = React.useState(false);

  return {
    search,
    setSearch,
    checkBoxesState,
    setCheckBoxesState,
    freezedSearchState,
    setFreezedSearchState,
    hasSearched,
    setHasSearched,
  };
};
