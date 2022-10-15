import optionalRequire from '../../Utils/OptionalRequire';
const electron = optionalRequire('electron');
const remote = optionalRequire('@electron/remote');

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
