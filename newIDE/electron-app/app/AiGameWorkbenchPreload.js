const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('gdevelopWorkbench', {
  importGDevelopExtension: payload =>
    ipcRenderer.invoke(
      'ai-game-workbench-import-gdevelop-extension',
      payload
    ),
});
