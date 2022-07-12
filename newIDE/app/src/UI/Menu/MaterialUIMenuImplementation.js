import React, { useState, useRef, useCallback } from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import Fade from '@material-ui/core/Fade';

const styles = {
  menuItemWithSubMenu: { justifyContent: 'space-between' },
  divider: { marginLeft: 16, marginRight: 16 },
};

const SubMenuItem = ({ item, buildFromTemplate }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const anchorElement = useRef(null);
  const setAnchorElement = useCallback(element => {
    anchorElement.current = element;
  }, []);

  return (
    <React.Fragment>
      <MenuItem
        dense
        style={styles.menuItemWithSubMenu}
        key={item.label}
        disabled={item.enabled === false}
        onClick={event => {
          if (item.enabled === false) {
            return;
          }

          if (!anchorElement.current) {
            setAnchorElement(event.currentTarget);
          }

          setMenuOpen(!menuOpen);
        }}
      >
        {item.label}
        <ArrowRightIcon ref={anchorElement} />
      </MenuItem>
      <Menu
        open={menuOpen}
        anchorEl={anchorElement.current}
        onClose={() => setMenuOpen(false)}
        TransitionComponent={Fade}
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
  constructor({ onClose }) {
    this._onClose = onClose;
  }

  buildFromTemplate(template) {
    return template
      .map((item, id) => {
        if (item.visible === false) return null;

        // Accelerator is not implemented for Material-UI menus
        // const accelerator = item.accelerator
        //   ? adaptAcceleratorString(item.accelerator)
        //   : undefined;

        if (item.type === 'separator') {
          return <Divider key={'separator' + id} style={styles.divider} />;
        } else if (item.type === 'checkbox') {
          return (
            <MenuItem
              dense
              key={'checkbox' + item.label}
              checked={item.checked}
              disabled={item.enabled === false}
              onClick={() => {
                if (item.enabled === false) {
                  return;
                }

                if (item.click) {
                  item.click();
                }
                this._onClose();
              }}
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
            >
              {item.label}
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
