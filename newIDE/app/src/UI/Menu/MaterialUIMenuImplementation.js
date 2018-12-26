import React from 'react';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import { adaptAcceleratorString } from '../AcceleratorString';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';

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

        if (item.type === 'separator') {
          return <Divider key={'separator' + id} />;
        } else if (item.type === 'checkbox') {
          return (
            <MenuItem
              key={item.label}
              primaryText={item.label}
              secondaryText={
                item.accelerator
                  ? adaptAcceleratorString(item.accelerator)
                  : undefined
              }
              checked={item.checked}
              insetChildren={!item.checked}
              disabled={item.enabled === false}
              onClick={() => {
                if (item.click) {
                  item.click();
                  this._onClose();
                }
              }}
              rightIcon={item.submenu ? <ArrowDropRight /> : undefined}
              menuItems={
                item.submenu ? this.buildFromTemplate(item.submenu) : undefined
              }
            />
          );
        } else {
          return (
            <MenuItem
              key={item.label}
              primaryText={item.label}
              secondaryText={
                item.accelerator
                  ? adaptAcceleratorString(item.accelerator)
                  : undefined
              }
              disabled={item.enabled === false}
              onClick={() => {
                if (item.click) {
                  item.click();
                  this._onClose();
                }
              }}
              rightIcon={item.submenu ? <ArrowDropRight /> : undefined}
              menuItems={
                item.submenu ? this.buildFromTemplate(item.submenu) : undefined
              }
            />
          );
        }
      })
      .filter(Boolean);
  }

  showMenu() {
    // Automatically done by IconMenu
  }

  getMenuProps() {
    return {
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'left',
      },
    };
  }
}
