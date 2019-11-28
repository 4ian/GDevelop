import React from 'react';
import { ListItem } from './List';
import BackgroundText from './BackgroundText';
// No i18n in this file

type Props = {|
  onClick?: () => void,
  primaryText: React.Node,
  identifier?: string,
|};

export const AddListItem = (props: Props) => {
  return (
    <div
     {...(props.identifier ? { className: 'guideline-' + props.identifier } : {})}
    >
    <ListItem
      onClick={props.onClick}
      primaryText={<BackgroundText>{props.primaryText}</BackgroundText>}
      displayAddIcon
    />
    </div>
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
