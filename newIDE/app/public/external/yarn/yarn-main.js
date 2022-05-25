import { createPathEditorHeader, fileExists } from '../utils/path-editor.js';

const electron = require('electron');
const remote = require('@electron/remote');
const electronWindow = remote.getCurrentWindow();
const ipcRenderer = electron.ipcRenderer;
const fs = require('fs');

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
  yarn.app.remote = remote;
  yarn.data.restoreFromLocalStorage(false);
  ipcRenderer.send('yarn-ready');
});
editorFrameEl.src = 'yarn-editor/index.html';

// Called to load yarn data. Should be called after the window is fully loaded.
ipcRenderer.on('yarn-open', (event, receivedData) => {
  // Make the header.
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

  // Inject custom Apply button.
  const saveToGdButton = yarn.document
    .getElementsByClassName('search-tags')[0]
    .cloneNode(true);
  saveToGdButton.onclick = () => saveAndClose(pathEditorHeader);
  yarn.document
    .getElementsByClassName('search-tags')[0]
    .parentElement.appendChild(saveToGdButton);
  saveToGdButton.childNodes[0].checked = 'checked';
  saveToGdButton.childNodes[2].innerHTML = 'Apply';
  saveToGdButton.childNodes[2].style = 'background-color: white;';
  yarn.document.getElementsByClassName('app-search')[0].style = 'right: 45px';
  saveToGdButton.style = 'padding-left: 30px;';

  // Process the json file to open, if any.
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
    // Set up a new path for the JSON to be saved if none was passed.
    receivedData.resourcePath = receivedData.projectPath + '/NewFile.json';
  }

  yarn.data.editingPath(receivedData.resourcePath);
  yarn.data.editingType('json');
});
