// @flow
import * as React from 'react';
import MUIList from '@material-ui/core/List';
import MUIListItem from '@material-ui/core/ListItem';
import MUIListItemIcon from '@material-ui/core/ListItemIcon';
import MUIListItemText from '@material-ui/core/ListItemText';
import MUIListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import Refresh from '@material-ui/icons/Refresh';
import MoreVert from '@material-ui/icons/MoreVert';
import OpenInNew from '@material-ui/icons/OpenInNew';
import Remove from '@material-ui/icons/Remove';
import ElementWithMenu from './Menu/ElementWithMenu';
import Tooltip from '@material-ui/core/Tooltip';
import Add from '@material-ui/icons/Add';
import Search from '@material-ui/icons/Search';
import { type MenuItemTemplate } from './Menu/Menu.flow';

const useDenseLists = true;
export const listItemWith32PxIconHeight = 40;
export const listItemWithoutIconHeight = 37;

type DoubleClickMouseEvent = {| button: 0 | 1 | 2 |};

// Support for a bunch of different secondary actions
type ListItemRightButtonProps =
  | {|
      displayReloadButton: boolean,
      reloadButtonTooltip: string,
      onReload?: () => void,
    |}
  | {|
      displayMenuButton: boolean,
      buildMenuTemplate: () => Array<MenuItemTemplate>,
    |}
  | {|
      displayLinkButton: boolean,
      onOpenLink: () => void,
    |}
  | {|
      displayRemoveButton: true,
      onRemove: () => void,
    |}
  | {|
      displayAddIcon: true,
    |}
  | {|
      displaySearchIcon: true,
    |}
  | {||};

// We support a subset of the props supported by Material-UI v0.x ListItem
// They should be self descriptive - refer to Material UI docs otherwise.
type ListItemProps = {|
  onClick?: () => void,
  onDoubleClick?: (event: DoubleClickMouseEvent) => void,
  primaryText: ?React.Node,
  secondaryText?: React.Node,
  selected?: boolean,
  autoGenerateNestedIndicator?: boolean, // TODO: Rename?
  renderNestedItems?: () => Array<React$Element<any> | null>,
  open?: boolean,
  initiallyOpen?: boolean,
  disabled?: boolean,

  nestedListStyle?: {|
    padding: 0,
  |},

  style?: {|
    color?: string,
    backgroundColor?: string,
    borderBottom?: string,
    opacity?: number,
  |},

  leftIcon?: React.Node,
  ...ListItemRightButtonProps,

  secondaryTextLines?: 1 | 2,
|};

type ListItemState = {|
  isOpen: boolean,
|};

/**
 * A ListItem to be used in a List.
 *
 * Also used outside of a List by virtualized lists.
 */
export class ListItem extends React.Component<ListItemProps, ListItemState> {
  state = {
    isOpen: !!this.props.initiallyOpen,
  };
  _elementWithMenu: ?ElementWithMenu;

  _renderListItemSecondaryAction = () => {
    const { props } = this;
    if (props.displayReloadButton) {
      return (
        <MUIListItemSecondaryAction>
          <Tooltip title={props.reloadButtonTooltip}>
            <IconButton edge="end" aria-label="reload" onClick={props.onReload}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </MUIListItemSecondaryAction>
      );
    }
    if (props.buildMenuTemplate) {
      return props.displayMenuButton ? (
        <MUIListItemSecondaryAction>
          <ElementWithMenu
            ref={elementWithMenu => (this._elementWithMenu = elementWithMenu)}
            element={
              <IconButton edge="end" aria-label="menu">
                <MoreVert />
              </IconButton>
            }
            buildMenuTemplate={props.buildMenuTemplate}
          />
        </MUIListItemSecondaryAction>
      ) : (
        <ElementWithMenu
          ref={elementWithMenu => (this._elementWithMenu = elementWithMenu)}
          element={
            <div /> /* We still need a dummy div for context menu placement */
          }
          buildMenuTemplate={props.buildMenuTemplate}
        />
      );
    }
    if (props.displayLinkButton) {
      return (
        <MUIListItemSecondaryAction>
          <IconButton
            edge="end"
            aria-label="open link"
            onClick={props.onOpenLink}
          >
            <OpenInNew />
          </IconButton>
        </MUIListItemSecondaryAction>
      );
    }
    if (props.displayRemoveButton) {
      return (
        <MUIListItemSecondaryAction>
          <IconButton edge="end" aria-label="remove" onClick={props.onRemove}>
            <Remove />
          </IconButton>
        </MUIListItemSecondaryAction>
      );
    }

    return null;
  };

  _openContextMenu = (event: any) => {
    if (this._elementWithMenu) {
      this._elementWithMenu.open(event);
    }
  };

  render() {
    const { props, state } = this;
    const { renderNestedItems } = props;

    if (!renderNestedItems) {
      return (
        <MUIListItem
          button
          dense={useDenseLists}
          disableRipple
          ContainerComponent={
            'div' /* Otherwise, when ListItemSecondaryAction is defined, we would get a li, that is not playing well in virtualized list, that are using ListItem without List */
          }
          onClick={props.onClick}
          onDoubleClick={props.onDoubleClick}
          disabled={props.disabled}
          selected={props.selected}
          style={props.style}
          onContextMenu={
            props.buildMenuTemplate ? this._openContextMenu : undefined
          }
          alignItems={props.secondaryTextLines === 2 ? 'flex-start' : undefined}
        >
          {props.leftIcon && (
            <MUIListItemIcon>{props.leftIcon}</MUIListItemIcon>
          )}
          <MUIListItemText
            primary={props.primaryText}
            secondary={props.secondaryText}
          />
          {this._renderListItemSecondaryAction()}
          {props.displayAddIcon && <Add />}
          {props.displaySearchIcon && <Search />}
        </MUIListItem>
      );
    } else {
      const isOpen = props.open === undefined ? state.isOpen : props.open;
      return (
        <React.Fragment>
          <MUIListItem
            button
            dense={useDenseLists}
            disableRipple
            onClick={() => {
              this.setState(state => ({ isOpen: !state.isOpen }));
              if (props.onClick) {
                props.onClick();
              }
            }}
            disabled={props.disabled}
            style={props.style}
          >
            {props.leftIcon && (
              <MUIListItemIcon>{props.leftIcon}</MUIListItemIcon>
            )}
            <MUIListItemText
              primary={props.primaryText}
              secondary={props.secondaryText}
            />
            {props.autoGenerateNestedIndicator ? (
              isOpen ? (
                <ExpandLess />
              ) : (
                <ExpandMore />
              )
            ) : null}
            {this._renderListItemSecondaryAction()}
          </MUIListItem>
          {isOpen && (
            <MUIList
              component="div"
              disablePadding
              style={{
                paddingLeft: 16,
                ...props.nestedListStyle,
              }}
              dense={useDenseLists}
            >
              {renderNestedItems()}
            </MUIList>
          )}
        </React.Fragment>
      );
    }
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
    return (
      <MUIList style={this.props.style} dense={useDenseLists}>
        {this.props.children}
      </MUIList>
    );
  }
}
