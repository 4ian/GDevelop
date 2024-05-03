// @flow
import * as React from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import Fade from '@material-ui/core/Fade';
import makeStyles from '@material-ui/styles/makeStyles';
import { adaptAcceleratorString } from '../AcceleratorString';
import {
  type MenuItemTemplate,
  type ContextMenuImplementation,
} from './Menu.flow';
import ChevronArrowRight from '../CustomSvgIcons/ChevronArrowRight';

const useStyles = makeStyles({
  backdropRootForMouse: {
    // Put a `pointer-events: none` on the root of the "popover" which is showing
    // submenus as only the menu is supposed to receive clicks.
    pointerEvents: 'none',
  },
});

const styles = {
  divider: { marginLeft: 16, marginRight: 16 },
  labelWithAccelerator: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
  },
  accelerator: { opacity: 0.65, marginLeft: 16 },
  menuItemWithSubMenu: { height: 32, justifyContent: 'space-between' },
  menuItem: {
    // Force every menu item to have the same height, even if it's a submenu
    // or if it has an icon.
    height: 32,
    paddingLeft: 16, // Increase the default padding from 8 to 16 to be easier to read and match the electron menu.
    paddingRight: 16,
  },
};

const SubMenuItem = ({ item, buildFromTemplate }) => {
  // The invisible backdrop behind the submenu is either:
  // - not clickable, when using a mouse (it's like it does not exist).
  // - clickable, when on a touchscreen or using a pen. This is to allow closing the submenu
  // by clicking outside it.
  const backdropStyles = useStyles();
  const [pointerType, setPointerType] = React.useState<?'mouse' | 'other'>(
    null
  );

  // We track if the cursor is hovering the menu item or the submenu.
  // If not a mouse, this is not used: all menus are opened/closed
  // by clicking on them (`handleClick`) or outside (`handleClose` called when the backdrop is clicked).
  const currentlyHovering = React.useRef(false);

  // The anchor element is the DOM element of the menu item, when the submenu is opened.
  // When null, the submenu stays closed.
  const [anchorElement, setAnchorElement] = React.useState(null);

  const handleClick = event => {
    // $FlowFixMe - even if not defined, not a problem.
    if (item.enabled === false) {
      return;
    }

    if (!anchorElement) {
      setAnchorElement(event.currentTarget);
    }
  };

  const handlePointerOver = (pointerEvent: SyntheticPointerEvent<>) => {
    // $FlowFixMe - even if not defined, not a problem.
    if (item.enabled === false) {
      return;
    }

    setPointerType(pointerEvent.pointerType === 'mouse' ? 'mouse' : 'other');

    // If not a mouse, do nothing: all menus are opened/closed
    // by clicking on them (`handleClick`) or outside (`handleClose` called when the backdrop is clicked).
    // There is no notion of the "cursor" for touch/pen leaving a menu.
    if (pointerEvent.pointerType !== 'mouse') {
      return;
    }

    if (!anchorElement) {
      setAnchorElement(pointerEvent.currentTarget);
    }
  };

  function handleHover() {
    // When we hover the menu item or the submenu, we remember it
    // so it's not closed.
    currentlyHovering.current = true;
  }

  function handleClose() {
    setAnchorElement(null);
  }

  function handleLeave(pointerEvent: SyntheticPointerEvent<>) {
    // If not a mouse, do nothing: all menus are opened/closed
    // by clicking on them (`handleClick`) or outside (`handleClose` called when the backdrop is clicked).
    // There is no notion of the "cursor" for touch/pen leaving a menu.
    if (pointerEvent.pointerType !== 'mouse') {
      return;
    }

    // Unless overwrote in the meantime, we consider that
    // we're not hovering the menu anymore...
    currentlyHovering.current = false;

    // ...But give 75ms to the user before closing the menu,
    // if it the menu or the item was not hovered again in the meantime.
    setTimeout(() => {
      if (!currentlyHovering.current) {
        handleClose();
      }
    }, 75);
  }

  return (
    <React.Fragment>
      <MenuItem
        dense
        style={styles.menuItemWithSubMenu}
        key={item.label}
        disabled={
          // $FlowFixMe - even if not defined, not a problem.
          item.enabled === false
        }
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerLeave={handleLeave}
      >
        {item.label}
        <ChevronArrowRight />
      </MenuItem>
      <Menu
        open={!!anchorElement}
        anchorEl={anchorElement}
        onClose={handleClose}
        TransitionComponent={Fade}
        MenuListProps={{
          onPointerEnter: handleHover,
          onPointerLeave: handleLeave,

          // When a mouse is used, only the menu, when shown, can receive clicks
          // (not the background, see `popoverStyles.popOverRoot`).
          style: { pointerEvents: 'auto' },
        }}
        getContentAnchorEl={
          // Counterintuitive, but necessary
          // as per https://github.com/mui/material-ui/issues/7961#issuecomment-326116559.
          null
        }
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        PopoverClasses={{
          root:
            pointerType === 'mouse'
              ? // For a mouse, use a backdrop in the background that does not recognise clicks on it.
                // The menu will be closed by the cursor leaving it or the menu item (see `handleLeave`).
                backdropStyles.backdropRootForMouse
              : // For a touch or a pen, use the classic backdrop which allows to close the menu when clicked
                // outside (the backdrop will call `handleClose`).
                undefined,
        }}
      >
        {buildFromTemplate(item.submenu)}
      </Menu>
    </React.Fragment>
  );
};

/**
 * Construct items for material-ui's Menu, using a template which
 * is partially supporting the Electron Menu API (https://github.com/electron/electron/blob/master/docs/api/menu-item.md).
 *
 * Supported options are:
 *  - click
 *  - visible
 *  - type ('separator' and 'checkbox')
 *  - label
 *  - accelerator
 *  - enabled
 *  - checked (when `type` is 'checkbox')
 *  - submenu
 */
export default class MaterialUIMenuImplementation
  implements ContextMenuImplementation {
  _onClose: () => void;
  constructor({ onClose }: {| onClose: () => void |}) {
    this._onClose = onClose;
  }

  buildFromTemplate(
    template: Array<MenuItemTemplate>,
    forceUpdate?: () => void
  ) {
    return template
      .map((item, id) => {
        if (item.visible === false) return null;

        const accelerator = item.accelerator
          ? adaptAcceleratorString(item.accelerator)
          : undefined;

        if (item.type === 'separator') {
          return <Divider key={'separator' + id} style={styles.divider} />;
        } else if (item.type === 'checkbox') {
          return (
            <MenuItem
              dense
              key={'checkbox' + item.label}
              checked={
                // $FlowFixMe - existence should be inferred by Flow.
                item.checked
              }
              disabled={
                // $FlowFixMe - existence should be inferred by Flow.
                item.enabled === false
              }
              onClick={async e => {
                e.stopPropagation();
                if (item.enabled === false) {
                  return;
                }

                if (item.click) {
                  await item.click();
                  if (item.type === 'checkbox') {
                    // In case the item click function changes something that React does not detect,
                    // for instance a change in the project/layout C++ object, the menu must be
                    // manually updated to display the change.
                    if (forceUpdate) forceUpdate();
                    return;
                  }
                }
                this._onClose();
              }}
              style={styles.menuItem}
            >
              <ListItemIcon>
                {item.checked ? (
                  <CheckBoxIcon fontSize="small" />
                ) : (
                  <CheckBoxOutlineBlankIcon fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </MenuItem>
          );
        } else if (item.submenu) {
          return (
            <SubMenuItem
              key={'submenu' + item.label}
              item={item}
              buildFromTemplate={template =>
                this.buildFromTemplate(template, forceUpdate)
              }
            />
          );
        } else {
          return (
            <MenuItem
              dense
              key={'item' + item.label}
              disabled={item.enabled === false}
              onClick={e => {
                e.stopPropagation();
                if (item.enabled === false) {
                  return;
                }

                if (item.click) {
                  item.click();
                  this._onClose();
                }
              }}
              style={styles.menuItem}
            >
              {!accelerator ? (
                item.label
              ) : (
                <div style={styles.labelWithAccelerator}>
                  <span>{item.label}</span>
                  <span style={styles.accelerator}>{accelerator}</span>
                </div>
              )}
            </MenuItem>
          );
        }
      })
      .filter(Boolean);
  }

  showMenu() {
    // Automatically done by IconMenu
  }

  getMenuProps() {
    return {};
  }
}
