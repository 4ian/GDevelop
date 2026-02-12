// @flow
import * as React from 'react';
import { ListItem } from '../../../UI/List';
import HighlightedText from '../../../UI/Search/HighlightedText';
import Folder from '../../../UI/CustomSvgIcons/Folder';

type Props = {|
  folderWithPath: {|
    path: string,
    folder: gdObjectFolderOrObject,
    global: boolean,
  |},
  iconSize: number,
  matchesCoordinates: number[][],
|};

export const renderFolderListItem = ({
  folderWithPath,
  iconSize,
  matchesCoordinates,
}: Props) => {
  const folderPath: string = folderWithPath.path;
  return (
    <ListItem
      key={folderPath}
      selected={false}
      primaryText={
        <HighlightedText
          text={folderPath}
          matchesCoordinates={matchesCoordinates}
        />
      }
      leftIcon={<Folder width={iconSize} />}
      disableAutoTranslate
    />
  );
};
