import {
  loadHeader,
  updateBasePath,
  saveOptions
} from '../Utils/pathEditor.js';

const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const fs = require('fs');
const remote = electron.remote;

let editorContentDocument, jsfx = null

const loadMetaData = (metaData) => {
  jsfx.CurrentParams = metaData;
  jsfx.UpdateCurrentView()
  jsfx.PlayCurrent()
};

const closeWindow = () => {
  remote.getCurrentWindow().close();
};

const saveSoundEffect = () => {
  updateBasePath(); // Recalculate basepath to save
  jsfx.UpdateDownloadLink() //Update base64 data
  let rawData = editorContentDocument.getElementById('download').href; //store params
  rawData = rawData.replace(/^data:audio\/wav;base64,/, "");
  fs.writeFile(saveOptions.fullPath, rawData, 'base64', function (err) {
    ipcRenderer.send(
      'jsfx-changes-saved',
      saveOptions.fullPath,
      jsfx.CurrentParams
    );
    closeWindow();
  });
};

// we need to first declare when the window is ready to be initiated
document.addEventListener('DOMContentLoaded', function () {
  ipcRenderer.send('jsfx-ready')
});
// then trigger bellow from main
ipcRenderer.on('jsfx-open', (event, receivedOptions) => {
  const editorFrameEl = document.getElementById('jsfx-frame');
  jsfx = editorFrameEl.contentWindow;
  editorContentDocument = editorFrameEl.contentDocument;
  const presetsPanel = editorContentDocument.getElementById('presets');

  // load metadata from GD if there is such
  if ('jsfx' in receivedOptions.initialResourceMetadata) {
    loadMetaData(receivedOptions.initialResourceMetadata.jsfx);
  } else {
    presetsPanel.childNodes[11].click()
  };

  // load custom header
  const pathEditorHeader = document.getElementById('path-editor-header');
  loadHeader(pathEditorHeader, document, saveSoundEffect, closeWindow, receivedOptions.projectPath, receivedOptions.initialResourcePath, '.wav')

  // alter the interface
  editorContentDocument.getElementById('jsfx').firstChild.style = 'float:top'
  const defaultTitle = editorContentDocument.getElementsByClassName(
    'title'
  )[0].firstChild;
  defaultTitle.remove()

  presetsPanel.className = 'description'
  presetsPanel.style = 'float:left;'

  const generatorsTitle = editorContentDocument.getElementsByClassName(
    'panel-title'
  )[1].firstChild;
  generatorsTitle.data = 'Create a Random Sound Effect:'

  const description = editorContentDocument.getElementsByClassName(
    'description'
  )[0];
  description.remove()

  const libraryPanel = editorContentDocument.getElementsByClassName(
    'panel wide'
  )[0];
  libraryPanel.style.visibility = 'hidden'

  const defaultButtons = editorContentDocument.getElementById(
    'control'
  )
  defaultButtons.style = 'visibility:hidden;height:0px;width:0px'
});