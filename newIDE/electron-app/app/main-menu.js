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
        label: 'Create a new project...',
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
        label: 'Close',
        accelerator: 'CommandOrControl+W',
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
        label: 'Show Start Page',
        click() {
          window.webContents.send('main-menu-open-start-page');
        },
      },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ],
  };

  const windowTemplate = {
    role: 'window',
    submenu: [{ role: 'minimize' }, { role: 'close' }],
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
    ],
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
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
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
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' },
    ];
  }

  return Menu.buildFromTemplate(template);
};
module.exports = { buildMainMenuFor };
