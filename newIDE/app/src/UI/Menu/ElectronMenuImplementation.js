// @flow
import optionalRequire from '../../Utils/OptionalRequire';
import {
  type MenuItemTemplate,
  type ContextMenuImplementation,
} from './Menu.flow';
const electron = optionalRequire('electron');
const remote = optionalRequire('@electron/remote');

/**
 * Wraps an Electron Menu
 */
export default class ElectronMenuImplementation
  implements ContextMenuImplementation {
  menuTemplate: Array<MenuItemTemplate>;
  menu: any; // TODO: Is it necessary to store the menu in a class variable?

  buildFromTemplate(template: Array<MenuItemTemplate>) {
    this.menuTemplate = template;
    return undefined;
  }

  showMenu(dimensions: {|
    left: number,
    top: number,
    width: number,
    height: number,
  |}) {
    if (!electron) return;

    const { Menu } = remote;
    const browserWindow = remote.getCurrentWindow();
    this.menu = Menu.buildFromTemplate(this.menuTemplate);
    this.menu.popup({
      window: browserWindow,
      x: Math.round(dimensions.left),
      y: Math.round(dimensions.top + dimensions.height),
      async: true, // Ensure the UI is not blocked on macOS.
    });
  }

  getMenuProps() {
    return {
      open: false,
    };
  }
}
