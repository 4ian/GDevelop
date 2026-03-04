// @flow
import * as React from 'react';
import type { GlobalSearchGroup } from '../../../Utils/EventsGlobalSearchScanner';
import type { EventPath } from '../../../Types/EventPath';

export type GlobalSearchContextType = {|
  searchText: string,
  matchCase: boolean,
  navigateToMatch: (
    group: GlobalSearchGroup,
    focusedEventPath: EventPath
  ) => void,
|};

export const GlobalSearchContextProvider: React.Context<GlobalSearchContextType> = React.createContext<GlobalSearchContextType>(
  {
    searchText: '',
    matchCase: false,
    navigateToMatch: (
      _group: GlobalSearchGroup,
      _focusedEventPath: EventPath
    ) => {},
  }
);
