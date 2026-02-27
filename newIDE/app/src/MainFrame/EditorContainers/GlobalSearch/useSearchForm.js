// @flow
import * as React from 'react';

type CheckBoxesState = {|
  matchCase: boolean,
  searchInConditions: boolean,
  searchInActions: boolean,
  searchInEventStrings: boolean,
  searchInEventSentences: boolean,
  includeStoreExtensions: boolean,
|};

type FreezeSearchedState = {|
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
  frezeSearchedState: FreezeSearchedState,
  setFrezeSearchedState: (
    FreezeSearchedState | (FreezeSearchedState => FreezeSearchedState)
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
    includeStoreExtensions: false,
  });

  const [frezeSearchedState, setFrezeSearchedState] = React.useState({
    ...checkBoxesState,
    searchText: search,
  });
  const [hasSearched, setHasSearched] = React.useState(false);

  return {
    search,
    setSearch,
    checkBoxesState,
    setCheckBoxesState,
    frezeSearchedState,
    setFrezeSearchedState,
    hasSearched,
    setHasSearched,
  };
};
