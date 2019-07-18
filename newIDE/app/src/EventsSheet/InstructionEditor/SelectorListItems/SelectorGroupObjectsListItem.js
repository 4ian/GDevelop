// @flow
import * as React from 'react';
import { ListItem } from 'material-ui/List';
import ListIcon from '../../../UI/ListIcon';
import type { GroupWithContext } from '../../../ObjectsList/EnumerateObjects';

type Props = {|
  groupWithContext: GroupWithContext,
  iconSize: number,
  onClick: () => void,
|};

export default ({ groupWithContext, iconSize, onClick }: Props) => {
  const groupName: string = groupWithContext.group.getName();
  return (
    <ListItem
      key={groupName}
      primaryText={groupName}
      value={groupName}
      leftIcon={
        <ListIcon
          iconSize={iconSize}
          src="res/ribbon_default/objectsgroups64.png"
        />
      }
      onClick={onClick}
    />
  );
};
