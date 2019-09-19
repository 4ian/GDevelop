import { createPathEditorHeader, fileExists } from '../utils/path-editor.js';

const electron = require('electron');
const electronWindow = electron.remote.getCurrentWindow();
const ipcRenderer = electron.ipcRenderer;
const fs = require('fs');
const remote = electron.remote;

let yarn = null;

const saveAndClose = pathEditorHeader => {
  const savePath = pathEditorHeader.state.fullPath;
  yarn.data.saveTo(savePath, yarn.data.getSaveData('json'), () => {
    ipcRenderer.send('yarn-changes-saved', savePath);
    remote.getCurrentWindow().close();
  });
};

const closeWindow = () => {
  remote.getCurrentWindow().close();
};

const editorFrameEl = document.getElementById('yarn-frame');
window.addEventListener('yarnReady', e => {
  yarn = e;
  yarn.app.fs = fs;
  yarn.app.electron = electron;
  ipcRenderer.send('yarn-ready');
});
editorFrameEl.src = 'yarn-editor/index.html';

// Called to load yarn data. Should be called after the window is fully loaded.

ipcRenderer.on('yarn-open', (event, receivedData) => {
  //Make a header
  const pathEditorHeaderDiv = document.getElementById('path-editor-header');
  const pathEditorHeader = createPathEditorHeader({
    parentElement: pathEditorHeaderDiv,
    editorContentDocument: document,
    onSaveToGd: saveAndClose,
    onCancelChanges: closeWindow,
    projectPath: receivedData.projectPath,
    initialResourcePath: receivedData.resourcePath,
    extension: '.json',
  });
  //inject custom save+close button
  const saveToGdButton = yarn.document
    .getElementsByClassName('menu')[0]
    .cloneNode(true);
  saveToGdButton.onclick = () => saveAndClose(pathEditorHeader);
  yarn.document
    .getElementsByClassName('app-menu')[0]
    .appendChild(saveToGdButton);
  saveToGdButton.childNodes[0].firstChild.data = 'Apply';

  // process the json file,if it exists
  if (fileExists(receivedData.resourcePath)) {
    receivedData.externalEditorData = fs
      .readFileSync(receivedData.resourcePath, 'utf8')
      .toString();

    yarn.data.loadData(receivedData.externalEditorData, 'json', true);
    electronWindow.setTitle(
      'GDevelop Dialogue Tree Editor (Yarn) - ' + receivedData.resourcePath
    );

    pathEditorHeader.toggle();
  } else {
    // If GD has sent no path, we need to set one for yarn
    receivedData.resourcePath = receivedData.projectPath + '/NewFile.json';
  }

  yarn.data.editingPath(receivedData.resourcePath);
  yarn.data.editingType('json');
});
