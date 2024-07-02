// @flow
import * as React from 'react';
import { ListItem } from '../../../UI/List';
import ListIcon from '../../../UI/ListIcon';
import type { GroupWithContext } from '../../../ObjectsList/EnumerateObjects';
import {
  getObjectGroupListItemKey,
  getObjectOrObjectGroupListItemValue,
} from './Keys';
import HighlightedText from '../../../UI/Search/HighlightedText';
import { type HTMLDataset } from '../../../Utils/HTMLDataset';

type Props = {|
  groupWithContext: GroupWithContext,
  iconSize: number,
  onClick: () => void,
  selectedValue: ?string,
  matchesCoordinates: number[][],
  id: ?string,
  data?: HTMLDataset,
|};

export const renderGroupObjectsListItem = ({
  groupWithContext,
  iconSize,
  onClick,
  selectedValue,
  matchesCoordinates,
  id,
  data,
}: Props) => {
  const groupName: string = groupWithContext.group.getName();
  return (
    <ListItem
      id={id}
      data={data}
      key={getObjectGroupListItemKey(groupWithContext)}
      selected={
        selectedValue === getObjectOrObjectGroupListItemValue(groupName)
      }
      primaryText={
        <HighlightedText
          text={groupName}
          matchesCoordinates={matchesCoordinates}
        />
      }
      leftIcon={
        <ListIcon
          iconSize={iconSize}
          src="res/ribbon_default/objectsgroups64.png"
        />
      }
      onClick={onClick}
      disableAutoTranslate
    />
  );
};
