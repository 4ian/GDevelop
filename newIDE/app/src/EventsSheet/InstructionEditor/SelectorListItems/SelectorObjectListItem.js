// @flow
import * as React from 'react';
import { ListItem } from '../../../UI/List';
import ListIcon from '../../../UI/ListIcon';
import ObjectsRenderingService from '../../../ObjectsRendering/ObjectsRenderingService';
import type { ObjectWithContext } from '../../../ObjectsList/EnumerateObjects';
import {
  getObjectOrObjectGroupListItemValue,
  getObjectListItemKey,
} from './Keys';
import HighlightedText from '../../../UI/Search/HighlightedText';

type Props = {|
  project: gdProject,
  objectWithContext: ObjectWithContext,
  iconSize: number,
  onClick: () => void,
  selectedValue: ?string,
  matchesCoordinates: number[][],
  id?: ?string,
|};

export const renderObjectListItem = ({
  project,
  objectWithContext,
  iconSize,
  onClick,
  selectedValue,
  matchesCoordinates,
  id,
}: Props) => {
  const objectName: string = objectWithContext.object.getName();
  return (
    <ListItem
      id={id}
      key={getObjectListItemKey(objectWithContext)}
      selected={
        selectedValue === getObjectOrObjectGroupListItemValue(objectName)
      }
      primaryText={
        <HighlightedText
          text={objectName}
          matchesCoordinates={matchesCoordinates}
        />
      }
      leftIcon={
        <ListIcon
          iconSize={iconSize}
          src={ObjectsRenderingService.getThumbnail(
            project,
            objectWithContext.object.getConfiguration()
          )}
        />
      }
      onClick={onClick}
      disableAutoTranslate
    />
  );
};
