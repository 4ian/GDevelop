// @flow
import * as React from 'react';
import type { GlobalSearchGroup } from '../../../Utils/EventsGlobalSearchScanner';

export type GlobalSearchContextType = {|
  searchText: string,
  matchCase: boolean,
  navigateToMatch: (
    group: GlobalSearchGroup,
    focusedEventPath: Array<number>
  ) => void,
|};

export const GlobalSearchContextProvider: React.Context<GlobalSearchContextType> = React.createContext<GlobalSearchContextType>(
  {
    searchText: '',
    matchCase: false,
    navigateToMatch: (
      _group: GlobalSearchGroup,
      _focusedEventPath: Array<number>
    ) => {},
  }
);
