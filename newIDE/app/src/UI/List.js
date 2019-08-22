// @flow
import * as React from 'react';
import {
  List as MUIList,
  ListItem as MUIListItem,
  makeSelectable,
} from 'material-ui/List';

// We support a subset of the props supported by Material-UI v0.x ListItem
// They should be self descriptive - refer to Material UI docs otherwise.
type ListItemProps = {|
  onClick?: () => void,
  primaryText: ?React.Node,
  secondaryText?: React.Node,
  value?: string,
  primaryTogglesNestedList?: boolean,
  autoGenerateNestedIndicator?: boolean,
  nestedItems?: Array<React$Element<any> | null>,
  open?: boolean,
  initiallyOpen?: boolean,
  disabled?: boolean,

  nestedListStyle?: {|
    padding: 0,
  |},

  style?: {|
    backgroundColor?: string,
    borderBottom?: string,
    opacity?: number,
  |},

  onContextMenu?: () => void,

  leftIcon?: React.Node,
  leftAvatar?: React.Node,
  rightIconButton?: ?React.Node,

  secondaryTextLines?: number,
|};

/**
 * A ListItem to be used in a List.
 */
export class ListItem extends React.Component<ListItemProps, {||}> {
  // Set muiName to let Material-UI's v0.x List recognise
  // the component.
  static muiName = 'ListItem';

  // Add default props because Material-UI's v0.x List does look
  // into ListItem props and assumes nestedItems is always an array.
  static defaultProps = {
    nestedItems: [],
  }

  render() {
    return <MUIListItem {...this.props} />;
  }
}

// We support a subset of the props supported by Material-UI v0.x List
// They should be self descriptive - refer to Material UI docs otherwise.
type ListProps = {|
  children: React.Node,
  style?: {|
    overflowY?: 'scroll',
    flex?: 1,
    padding?: number,
  |},
|};

/**
 * List based on Material-UI List.
 */
export class List extends React.Component<ListProps, {||}> {
  render() {
    return <MUIList {...this.props} />;
  }
}

export const SelectableList = makeSelectable(MUIList);
