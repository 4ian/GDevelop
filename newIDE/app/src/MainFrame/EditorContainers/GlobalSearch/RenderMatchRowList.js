// @flow
import * as React from 'react';
import type { GlobalSearchGroup } from '../../../Utils/EventsGlobalSearchScanner';
import { RenderMatchRow } from './RenderMatchRow';

type RenderMatchRowListProps = {| group: GlobalSearchGroup |};

export const RenderMatchRowList: React.ComponentType<RenderMatchRowListProps> = React.memo<RenderMatchRowListProps>(
  ({ group }) => {
    return group.matches.map((match, index) => (
      <RenderMatchRow match={match} group={group} key={index} />
    ));
  }
);
