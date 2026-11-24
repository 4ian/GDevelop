const { app, clipboard, ipcMain } = require('electron');
const log = require('electron-log');

// The clipboard of Electron is asynchronous, but the editor reads it
// synchronously (including during renders): keep the last known text here.
let cachedText = '';

const refreshCachedText = () => {
  clipboard
    .readText()
    .then(text => {
      cachedText = text;
    })
    .catch(error => {
      log.warn('Failed to read the clipboard:', error);
    });
};

const setupClipboardTextCache = () => {
  refreshCachedText();
  // The clipboard can only have been changed by another app while no window was focused.
  app.on('browser-window-focus', refreshCachedText);

  ipcMain.on('clipboard-read-text', event => {
    event.returnValue = cachedText;
  });

  ipcMain.on('clipboard-write-text', (event, text) => {
    cachedText = typeof text === 'string' ? text : '';
    clipboard.writeText(cachedText).catch(error => {
      log.error('Failed to write the clipboard:', error);
    });
    event.returnValue = null;
  });
};

module.exports = {
  setupClipboardTextCache,
};
