import React from 'react';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import { isMacLike, isMobile } from '../../Utils/Platform';

const adaptAcceleratorString = (accelerator: string): string => {
  if (isMobile()) {
    return ''; // Do not display accelerators on mobile devices
  } else if (isMacLike()) {
    return accelerator
      .replace(/CmdOrCtrl\+/, '⌘')
      .replace(/CommandOrControl\+/, '⌘')
      .replace(/Super\+/, '⌘')
      .replace(/Shift\+/, '⇧')
      .replace(/Alt\+/, '⌥')
      .replace(/Option\+/, '⌥')
      .replace(/Delete/, '⌦')
      .replace(/Backspace/, '⌫');
  } else {
    return accelerator
      .replace(/CmdOrCtrl\+/, 'Ctrl+')
      .replace(/CommandOrControl\+/, 'Ctrl+')
      .replace(/Super\+/, 'Win+')
      .replace(/Option\+/, 'Alt+')
      .replace(/Delete/, 'DEL');
  }
};

/**
 * Construct items for material-ui's Menu, using a template which
 * is partially supporting the Electron Menu API (https://github.com/electron/electron/blob/master/docs/api/menu-item.md).
 *
 * Supported options are:
 *  - click
 *  - type ('separator' and 'checkbox')
 *  - label
 *  - accelerator
 *  - enabled
 *  - checked (when `type` is 'checkbox')
 */
export default class MaterialUIMenuImplementation {
  constructor({ onClose }) {
    this._onClose = onClose;
  }

  buildFromTemplate(template) {
    return template.map((item, id) => {
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
              item.click();
              this._onClose();
            }}
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
              item.click();
              this._onClose();
            }}
          />
        );
      }
    });
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
