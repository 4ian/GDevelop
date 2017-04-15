import optionalRequire from '../../Utils/OptionalRequire.js';
const electron = optionalRequire('electron');

export default class ElectronMenuImplementation {
  buildFromTemplate(template) {
    if (!electron) return;

    const { Menu } = electron.remote;
    this.menu = Menu.buildFromTemplate(template);

    return undefined;
  }

  showMenu(dimensions) {
    if (!electron) return;
    if (this.menu) {
      setTimeout(() =>
        this.menu.popup(
          Math.round(dimensions.left),
          Math.round(dimensions.top + dimensions.height)
        ));
    }
  }

  getMenuProps() {
    return {
      open: false,
    };
  }
}
