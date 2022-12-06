const electron = require('electron');
const { app, Menu, ipcMain } = electron;
const package = require('./package.json');

/**
 * Create the editor main menu. Menu items that requires interaction
 * with the editor and that are not native are sent using events
 * to the electron renderer process (see ElectronEventsBridge).
 *
 * @param {BrowserWindow} window The window for which the menu is built
 * @param {Object[]} mainMenuTemplate The template (see ElectronMainMenu.js), where "click" is replaced
 * by declarative properties like onClickSendEvent or onClickOpenLink.
 */
const buildElectronMenuFromDeclarativeTemplate = (window, mainMenuTemplate) => {
  const adaptMenuDeclarativeItemTemplate = menuTemplate =>
    menuTemplate.map(menuItemTemplate => {
      const hasOnClick =
        menuItemTemplate.onClickSendEvent || menuItemTemplate.onClickOpenLink;
      const args = menuItemTemplate.eventArgs;

      return {
        ...menuItemTemplate,
        click: hasOnClick
          ? function() {
              if (menuItemTemplate.onClickSendEvent) {
                if (args)
                  window.webContents.send(
                    menuItemTemplate.onClickSendEvent,
                    args
                  );
                else window.webContents.send(menuItemTemplate.onClickSendEvent);
              }

              if (menuItemTemplate.onClickOpenLink) {
                electron.shell.openExternal(menuItemTemplate.onClickOpenLink);
              }
            }
          : undefined,
        submenu: menuItemTemplate.submenu
          ? adaptMenuDeclarativeItemTemplate(menuItemTemplate.submenu)
          : undefined,
      };
    });

  return Menu.buildFromTemplate(
    mainMenuTemplate.map(rootMenuTemplate => ({
      ...rootMenuTemplate,
      submenu: adaptMenuDeclarativeItemTemplate(rootMenuTemplate.submenu),
    }))
  );
};

/**
 * Create a placeholder main menu, displayed before the real main menu
 * is constructed.
 */
const buildPlaceholderMainMenu = () => {
  const placeholderMenuItem = {
    label: 'GDevelop is loading...',
    enabled: false,
  };

  const fileTemplate = {
    label: 'File',
    submenu: [placeholderMenuItem],
  };

  const editTemplate = {
    label: 'Edit',
    submenu: [placeholderMenuItem],
  };

  const viewTemplate = {
    label: 'View',
    submenu: [placeholderMenuItem],
  };

  const windowTemplate = {
    role: 'window',
    submenu: [{ role: 'minimize' }],
  };

  const helpTemplate = {
    role: 'help',
    submenu: [placeholderMenuItem],
  };

  const template = [
    fileTemplate,
    editTemplate,
    viewTemplate,
    windowTemplate,
    helpTemplate,
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: 'GDevelop 5',
      submenu: [placeholderMenuItem],
    });

    windowTemplate.submenu = [
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' },
    ];
  }

  return Menu.buildFromTemplate(template);
};

module.exports = {
  buildElectronMenuFromDeclarativeTemplate,
  buildPlaceholderMainMenu,
};
