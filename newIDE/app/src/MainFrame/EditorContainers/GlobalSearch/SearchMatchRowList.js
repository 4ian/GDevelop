// @flow
import * as React from 'react';
import type { GlobalSearchGroup } from '../../../Utils/EventsGlobalSearchScanner';
import { SearchMatchRow } from './SearchMatchRow';

type SearchMatchRowListProps = {| group: GlobalSearchGroup |};

export const SearchMatchRowList: React.ComponentType<SearchMatchRowListProps> = React.memo<SearchMatchRowListProps>(
  ({ group }) => {
    return group.matches.map((match, index) => (
      <SearchMatchRow match={match} group={group} key={index} />
    ));
  }
);
