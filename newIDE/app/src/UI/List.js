// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
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
import { dataObjectToProps, type HTMLDataset } from '../Utils/HTMLDataset';
import { useLongTouch } from '../Utils/UseLongTouch';
import { Collapse } from '@material-ui/core';
const useDenseLists = true;
export const listItemWith32PxIconHeight = 32;
export const listItemWithoutIconHeight = 29;

const styles = {
  listItemText: {
    // Reduce the default spacing between list items
    // to densify the lists.
    margin: '1px 0',
    // Always break the words if necessary. Otherwise a long word
    // without spaces would be overflowing the list.
    // This seems to be necessary for all lists (we don't ever want
    // an overflow - and it's strange in a way that Material-UI is
    // not handling this by default?)
    wordBreak: 'break-word',
  },
  listWithGap: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    flexDirection: 'column',
  },
};

type DoubleClickMouseEvent = {| button: 0 | 1 | 2 |};

// Support for a bunch of different secondary actions
type ListItemRightButtonProps =
  | {|
      displayReloadButton: boolean,
      reloadButtonTooltip: React.Node,
      onReload?: () => void,
    |}
  | {|
      displayMenuButton: boolean,
      buildMenuTemplate: (i18n: I18nType) => Array<MenuItemTemplate>,
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
  onClick?: () => void | Promise<void>,
  onDoubleClick?: (event: DoubleClickMouseEvent) => void,
  primaryText: ?React.Node,
  secondaryText?: React.Node,
  disableAutoTranslate?: boolean,
  selected?: boolean,
  autoGenerateNestedIndicator?: boolean, // TODO: Rename?
  renderNestedItems?: () => Array<React$Element<any> | null>,
  open?: boolean,
  initiallyOpen?: boolean,
  disabled?: boolean,
  rightIconColor?: string,
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

  id?: ?string,
  data?: HTMLDataset,
|};

export type ListItemRefType = any; // Should be a material-ui ListIten

/**
 * A ListItem to be used in a List.
 *
 * Also used outside of a List by virtualized lists.
 */
export const ListItem = React.forwardRef<ListItemProps, ListItemRefType>(
  (props: ListItemProps, ref) => {
    const [isOpen, setIsOpen] = React.useState(!!props.initiallyOpen);
    const elementWithMenu = React.useRef<?ElementWithMenu>(null);

    const openContextMenu = React.useCallback(
      () => {
        if (elementWithMenu.current) {
          elementWithMenu.current.open();
        }
      },
      [elementWithMenu]
    );
    const longTouchForContextMenuProps = useLongTouch(openContextMenu);

    const renderListItemSecondaryAction = () => {
      if (props.displayReloadButton) {
        return (
          <MUIListItemSecondaryAction>
            <Tooltip title={props.reloadButtonTooltip}>
              <IconButton
                size="small"
                edge="end"
                aria-label="reload"
                onClick={props.onReload}
              >
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
              ref={elementWithMenu}
              element={
                <IconButton size="small" edge="end" aria-label="menu">
                  <MoreVert style={{ color: props.rightIconColor }} />
                </IconButton>
              }
              buildMenuTemplate={props.buildMenuTemplate}
            />
          </MUIListItemSecondaryAction>
        ) : (
          <ElementWithMenu
            ref={elementWithMenu}
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
              size="small"
              edge="end"
              aria-label="open link"
              onClick={props.onOpenLink}
            >
              <OpenInNew style={{ color: props.rightIconColor }} />
            </IconButton>
          </MUIListItemSecondaryAction>
        );
      }
      if (props.displayRemoveButton) {
        return (
          <MUIListItemSecondaryAction>
            <IconButton
              size="small"
              edge="end"
              aria-label="remove"
              onClick={props.onRemove}
            >
              <Remove style={{ color: props.rightIconColor }} />
            </IconButton>
          </MUIListItemSecondaryAction>
        );
      }

      return null;
    };

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
          onContextMenu={props.buildMenuTemplate ? openContextMenu : undefined}
          {...longTouchForContextMenuProps}
          alignItems={props.secondaryTextLines === 2 ? 'flex-start' : undefined}
          ref={ref}
          id={props.id}
          {...dataObjectToProps(props.data)}
        >
          {props.leftIcon && (
            <MUIListItemIcon>{props.leftIcon}</MUIListItemIcon>
          )}
          <MUIListItemText
            style={styles.listItemText}
            primary={props.primaryText}
            secondary={props.secondaryText}
            className={props.disableAutoTranslate ? 'notranslate' : ''}
          />
          {renderListItemSecondaryAction()}
          {props.displayAddIcon && (
            <Add style={{ color: props.rightIconColor }} />
          )}
          {props.displaySearchIcon && (
            <Search style={{ color: props.rightIconColor }} />
          )}
        </MUIListItem>
      );
    } else {
      const isItemOpen = props.open === undefined ? isOpen : props.open;
      return (
        <React.Fragment>
          <MUIListItem
            button
            dense={useDenseLists}
            disableRipple
            onClick={() => {
              setIsOpen(!isItemOpen);
              if (props.onClick) {
                props.onClick();
              }
            }}
            disabled={props.disabled}
            style={props.style}
            ref={ref}
            id={props.id}
            {...dataObjectToProps(props.data)}
          >
            {props.leftIcon && (
              <MUIListItemIcon>{props.leftIcon}</MUIListItemIcon>
            )}
            <MUIListItemText
              style={styles.listItemText}
              primary={props.primaryText}
              secondary={props.secondaryText}
              className={props.disableAutoTranslate ? 'notranslate' : ''}
            />
            {props.autoGenerateNestedIndicator ? (
              isItemOpen ? (
                <ExpandLess />
              ) : (
                <ExpandMore />
              )
            ) : null}
            {renderListItemSecondaryAction()}
          </MUIListItem>
          <Collapse in={isItemOpen} timeout="auto" unmountOnExit>
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
          </Collapse>
        </React.Fragment>
      );
    }
  }
);

// We support a subset of the props supported by Material-UI v0.x List
// They should be self descriptive - refer to Material UI docs otherwise.
type ListProps = {|
  children: React.Node,
  style?: {|
    overflowY?: 'scroll',
    flex?: 1,
    padding?: number,
  |},
  useGap?: boolean,
|};

/**
 * List based on Material-UI List.
 */
export const List = (props: ListProps) => {
  let listStyle = { ...props.style };
  if (props.useGap) {
    listStyle = { ...listStyle, ...styles.listWithGap };
  }
  return (
    <MUIList style={listStyle} dense={useDenseLists}>
      {props.children}
    </MUIList>
  );
};
