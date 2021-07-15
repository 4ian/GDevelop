// @flow
import * as React from 'react';
import { ListItem } from './List';
import BackgroundText from './BackgroundText';
// No i18n in this file

type Props = {|
  onClick?: () => void,
  primaryText: ?React.Node,
|};

export const AddListItem = (props: Props) => {
  return (
    <ListItem
      onClick={props.onClick}
      primaryText={<BackgroundText>{props.primaryText}</BackgroundText>}
      displayAddIcon
    />
  );
};

export const SearchListItem = (props: Props) => {
  return (
    <ListItem
      onClick={props.onClick}
      primaryText={<BackgroundText>{props.primaryText}</BackgroundText>}
      displaySearchIcon
    />
  );
};
