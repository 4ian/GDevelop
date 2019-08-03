import { createPathEditorHeader } from '../utils/path-editor.js';

const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const fs = require('fs');
const remote = electron.remote;

let yarn = null;

const saveAndClose = () => {
  console.log(yarn.data.getSaveData('json'));
  console.log(receivedData.resourcePath);
  yarn.data.saveTo(
    receivedData.resourcePath,
    yarn.data.getSaveData('json'),
    () => remote.getCurrentWindow().close()
  );
};

const closeWindow = () => {
  remote.getCurrentWindow().close();
};

const editorFrameEl = document.getElementById('yarn-frame');
window.addEventListener('yarnReady', e => {
  yarn = e;
  yarn.app.fs = fs;
  ipcRenderer.send('yarn-ready');
});
editorFrameEl.src = 'yarn-editor/app/index.html';

// Called to load yarn data. Should be called after the window is fully loaded.
let receivedData;
ipcRenderer.on('yarn-open', (event, receivedOptions) => {
  if (!yarn) return;
  yarn.data.editingPath(receivedOptions.resourcePath);
  yarn.data.editingType('json');
  yarn.data.loadData(receivedOptions.externalEditorData, 'json', true);
  receivedData = receivedOptions;

  //inject custom save+close button
  const saveToGdButton = yarn.document
    .getElementsByClassName('menu')[0]
    .cloneNode(true);
  saveToGdButton.onclick = () => saveAndClose();
  yarn.document
    .getElementsByClassName('app-menu')[0]
    .appendChild(saveToGdButton);
  saveToGdButton.childNodes[1].firstChild.data = 'Save & close';
});
