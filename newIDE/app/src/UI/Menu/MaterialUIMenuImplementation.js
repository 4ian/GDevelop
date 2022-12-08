// @flow
import * as React from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import Fade from '@material-ui/core/Fade';
import makeStyles from '@material-ui/styles/makeStyles';
import { adaptAcceleratorString } from '../AcceleratorString';
import { type MenuItemTemplate } from './Menu.flow';

const useStyles = makeStyles({
  popOverRoot: {
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
  },
};

const SubMenuItem = ({ item, buildFromTemplate }) => {
  const popoverStyles = useStyles();
  const currentlyHovering = React.useRef(false);
  const [anchorElement, setAnchorElement] = React.useState(null);

  const handleOpen = event => {
    // $FlowFixMe - even if not defined, not a problem.
    if (item.enabled === false) {
      return;
    }

    if (!anchorElement) {
      setAnchorElement(event.currentTarget);
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

  function handleLeave() {
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
        onClick={handleOpen}
        onPointerOver={handleOpen}
        onPointerLeave={handleLeave}
      >
        {item.label}
        <ArrowRightIcon />
      </MenuItem>
      <Menu
        open={!!anchorElement}
        anchorEl={anchorElement}
        onClose={handleClose}
        TransitionComponent={Fade}
        MenuListProps={{
          onPointerEnter: handleHover,
          onPointerLeave: handleLeave,

          // Only the menu, when shown, can receive clicks
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
          root: popoverStyles.popOverRoot,
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
export default class MaterialUIMenuImplementation {
  _onClose: () => void;
  constructor({ onClose }: {| onClose: () => void |}) {
    this._onClose = onClose;
  }

  buildFromTemplate(template: Array<MenuItemTemplate>) {
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
              onClick={() => {
                if (item.enabled === false) {
                  return;
                }

                if (item.click) {
                  item.click();
                }
                this._onClose();
              }}
              style={styles.menuItem}
            >
              <ListItemIcon>
                {item.checked ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </MenuItem>
          );
        } else if (item.submenu) {
          return (
            <SubMenuItem
              key={'submenu' + item.label}
              item={item}
              buildFromTemplate={template => this.buildFromTemplate(template)}
            />
          );
        } else {
          return (
            <MenuItem
              dense
              key={'item' + item.label}
              disabled={item.enabled === false}
              onClick={() => {
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
