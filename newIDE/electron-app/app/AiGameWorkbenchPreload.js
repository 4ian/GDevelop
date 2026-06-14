const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('gdevelopWorkbench', {
  openStorageDirectory: () =>
    ipcRenderer.invoke('ai-game-workbench-open-storage-directory'),
  importGDevelopExtension: payload =>
    ipcRenderer.invoke(
      'ai-game-workbench-import-gdevelop-extension',
      payload
    ),
});
