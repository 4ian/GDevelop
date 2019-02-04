const electron = require('electron');
const { app, Menu, ipcMain } = electron;
const package = require('./package.json');

/**
 * Create the editor main menu. Menu items that requires interaction
 * with the editor and that are not native are sent using events
 * to the electron renderer process (see ElectronEventsBridge).
 * @param {BrowserWindow} window
 */
const buildMainMenuFor = window => {
  const fileTemplate = {
    label: 'File',
    submenu: [
      {
        label: 'Create a New Project...',
        accelerator: 'CommandOrControl+N',
        click() {
          window.webContents.send('main-menu-create');
        },
      },
      { type: 'separator' },
      {
        label: 'Open...',
        accelerator: 'CommandOrControl+O',
        click() {
          window.webContents.send('main-menu-open');
        },
      },
      { type: 'separator' },
      {
        label: 'Save',
        accelerator: 'CommandOrControl+S',
        click() {
          window.webContents.send('main-menu-save');
        },
      },
      {
        label: 'Save as...',
        enabled: false, // TODO: Unimplemented for now
        click() {
          window.webContents.send('main-menu-save-as');
        },
      },
      { type: 'separator' },
      {
        label: 'Export (web, iOS, Android)...',
        click() {
          window.webContents.send('main-menu-export');
        },
      },
      { type: 'separator' },
      {
        label: 'Close Project',
        accelerator: 'CommandOrControl+Shift+W',
        click() {
          window.webContents.send('main-menu-close');
        },
      },
    ],
  };
  if (process.platform !== 'darwin') {
    fileTemplate.submenu.push(
      { type: 'separator' },
      {
        label: 'My Profile',
        click() {
          window.webContents.send('main-menu-open-profile');
        },
      },
      {
        label: 'Preferences',
        click() {
          window.webContents.send('main-menu-open-preferences');
        },
      }
    );
  }

  const editTemplate = {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'pasteandmatchstyle' },
      { role: 'delete' },
      { role: 'selectall' },
    ],
  };

  const viewTemplate = {
    label: 'View',
    submenu: [
      {
        label: 'Show Project Manager',
        accelerator: 'CommandOrControl+Alt+P',
        click() {
          window.webContents.send('main-menu-open-project-manager');
        },
      },
      {
        label: 'Show Start Page',
        click() {
          window.webContents.send('main-menu-open-start-page');
        },
      },
      {
        label: 'Open Debugger',
        click() {
          window.webContents.send('main-menu-open-debugger');
        },
      },
      { type: 'separator' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ],
  };

  const windowTemplate = {
    role: 'window',
    submenu: [{ role: 'minimize' }],
  };

  const helpTemplate = {
    role: 'help',
    submenu: [
      {
        label: 'GDevelop website',
        click() {
          electron.shell.openExternal(package.homepage);
        },
      },
      { type: 'separator' },
      {
        label: 'Community Forums',
        click() {
          electron.shell.openExternal('http://forum.compilgames.net');
        },
      },
      {
        label: 'Community Discord Chat',
        click() {
          electron.shell.openExternal('https://discord.gg/JWcfHEB');
        },
      },
      { type: 'separator' },
      {
        label: 'Contribute to GDevelop',
        click() {
          electron.shell.openExternal('https://gdevelop-app.com/contribute/');
        },
      },
      {
        label: 'Create Extensions for GDevelop',
        click() {
          electron.shell.openExternal('https://github.com/4ian/GDevelop/blob/master/newIDE/README-extensions.md');
        },
      },
    ],
  };
  if (process.platform !== 'darwin') {
    fileTemplate.submenu.push(
      { type: 'separator' },
      {
        label: 'About GDevelop',
        click() {
          window.webContents.send('main-menu-open-about');
        },
      },
    );
  }

  const template = [
    fileTemplate,
    editTemplate,
    viewTemplate,
    windowTemplate,
    helpTemplate,
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        {
          label: 'About GDevelop',
          click() {
            window.webContents.send('main-menu-open-about');
          },
        },
        { type: 'separator' },
        {
          label: 'My Profile',
          click() {
            window.webContents.send('main-menu-open-profile');
          },
        },
        {
          label: 'Preferences',
          click() {
            window.webContents.send('main-menu-open-preferences');
          },
        },
        { type: 'separator' },
        { role: 'services', submenu: [] },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });

    editTemplate.submenu.push(
      { type: 'separator' },
      {
        label: 'Speech',
        submenu: [{ role: 'startspeaking' }, { role: 'stopspeaking' }],
      }
    );

    windowTemplate.submenu = [
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' },
    ];
  }

  return Menu.buildFromTemplate(template);
};
module.exports = { buildMainMenuFor };
