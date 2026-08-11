const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('gdevelopAdvancedTweenBridge', {
  getProjectInfo: () =>
    ipcRenderer.invoke('advanced-tween-editor-get-project-info'),
  openAnimationFile: options =>
    ipcRenderer.invoke('advanced-tween-editor-open-animation-file', options),
  saveAnimationFile: options =>
    ipcRenderer.invoke('advanced-tween-editor-save-animation-file', options),
});
