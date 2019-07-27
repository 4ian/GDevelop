// @flow
import * as React from 'react';
import { ListItem } from 'material-ui/List';
import ListIcon from '../../../UI/ListIcon';
import ObjectsRenderingService from '../../../ObjectsRendering/ObjectsRenderingService';
import type { ObjectWithContext } from '../../../ObjectsList/EnumerateObjects';

type Props = {|
  project: gdProject,
  objectWithContext: ObjectWithContext,
  iconSize: number,
  onClick: () => void,
|};

export const renderObjectListItem = ({
  project,
  objectWithContext,
  iconSize,
  onClick,
}: Props) => {
  const objectName: string = objectWithContext.object.getName();
  return (
    <ListItem
      key={'object-' + objectWithContext.object.ptr}
      primaryText={objectName}
      value={objectName} // TODO: same as key
      leftIcon={
        <ListIcon
          iconSize={iconSize}
          src={ObjectsRenderingService.getThumbnail(
            project,
            objectWithContext.object
          )}
        />
      }
      onClick={onClick}
    />
  );
};
