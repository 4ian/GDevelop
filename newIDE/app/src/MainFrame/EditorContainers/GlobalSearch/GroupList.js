// @flow
import * as React from 'react';
import type { GlobalSearchGroup } from '../../../Utils/EventsGlobalSearchScanner';
import { GroupItem } from './GroupItem';

type GroupListProps = {| groups: GlobalSearchGroup[] |};

export const GroupList: React.ComponentType<GroupListProps> = React.memo<GroupListProps>(
  ({ groups }): React.Node => {
    return groups.map(group => <GroupItem group={group} key={group.id} />);
  }
);
