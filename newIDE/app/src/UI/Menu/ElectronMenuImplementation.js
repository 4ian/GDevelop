import optionalRequire from '../../Utils/OptionalRequire.js';
const electron = optionalRequire('electron');

/**
 * Wraps an Electron Menu
 */
export default class ElectronMenuImplementation {
  buildFromTemplate(template) {
    this.menuTemplate = template;
    return undefined;
  }

  showMenu(dimensions) {
    if (!electron) return;

    const { Menu } = electron.remote;
    const browserWindow = electron.remote.getCurrentWindow();
    this.menu = Menu.buildFromTemplate(this.menuTemplate);
    this.menu.popup(browserWindow, {
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
