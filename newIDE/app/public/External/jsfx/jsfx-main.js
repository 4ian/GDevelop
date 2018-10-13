const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
// const path = require('path');
const fs = require('fs');
const remote = electron.remote;
const {
  dialog
} = remote;

// const pathEditor = require('../Utils/pathEditor'); // doesnt work for some reason- cant find the module

let editorFrameEl, editorContentDocument, jsfx = null
let fileMetadata = null

const saveSoundEffect = () => {
  console.log('Save to:' + saveOptions.fullPath)
  updateBasePath(); // Recalculate basepathto save
  jsfx.UpdateDownloadLink() // Update data
  jsfx.PlayCurrent()
  let metaData = JSON.parse(JSON.stringify(jsfx.CurrentParams)); //store data
  let rawData = editorContentDocument.getElementById('download').href; //store params

  rawData = rawData.replace(/^data:audio\/wav;base64,/, "");
  fs.writeFile(saveOptions.fullPath, rawData, 'base64', function (err) {
    console.log(err);
    ipcRenderer.send(
      'jsfx-changes-saved',
      saveOptions.fullPath,
      metaData
    );
    remote.getCurrentWindow().close();
  });
}

document.getElementById('jsfx-frame').onload = function () {
  editorFrameEl = document.querySelector('#jsfx-frame');
  jsfx = editorFrameEl.contentWindow;

  editorContentDocument = document.getElementById('jsfx-frame')
    .contentDocument;

  editorContentDocument.getElementById('jsfx').firstChild.style = 'float:top'
  const defaultTitle = editorContentDocument.getElementsByClassName(
    'title'
  )[0].firstChild;
  defaultTitle.remove()

  const presetsPanel = editorContentDocument.getElementById('presets')
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

  if (fileMetadata) {
    console.log('Loaded previous Metadata:')
    console.log(fileMetadata)
    jsfx.CurrentParams = fileMetadata;
    jsfx.UpdateCurrentView()
    jsfx.PlayCurrent()
  } else { // if there is no metadata loaded, generate a random sound effect
    console.log('Generated a random sound effect.')
    presetsPanel.childNodes[11].click()
  }
}

const closeWindow = () => {
  remote.getCurrentWindow().close();
}

ipcRenderer.on('jsfx-open', (event, receivedOptions) => {
  console.log(receivedOptions.initialResourceMetadata)
  const pathEditorHeader = document.getElementById('path-editor-header');
  loadHeader(pathEditorHeader, document, saveSoundEffect, closeWindow, receivedOptions.projectPath, receivedOptions.initialResourcePath, '.wav')

  if (!receivedOptions.initialResourceMetadata) {
    return
  }
  if ('jsfx' in receivedOptions.initialResourceMetadata) {
    fileMetadata = receivedOptions.initialResourceMetadata.jsfx;
  }
});