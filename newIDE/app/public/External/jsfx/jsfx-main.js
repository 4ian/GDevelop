import {
  createHeader,
  renderPathEditor,
  getSaveOptions
} from '../Utils/pathEditor.js';

const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const fs = require('fs');
const remote = electron.remote;

const headerStyle = {
  saveFolderLabel: 'height:27px;color:SlateGrey;float: left;margin-left: 2px;margin-top: 10px; font-size:15px;',
  nameInput: 'font-family:"Courier New";height:27px;width:90px;color:SlateGrey;float:left;margin-left: 2px;padding:4px;margin-top: 4px;font-size:15px;border: 2px solid #e5cd50;border-radius: 3px;  ',
  fileExistsLabel: 'height:27px;color:blue;float: left;margin-left: 2px;margin-top: 10px; font-size:15px;',
  saveButton: 'height:27px;float:right;margin-left:2px;margin-right:4px;border: 2px solid DeepSkyBlue;border-radius: 1px;margin-top: 5px;background-color:white;',
  cancelButton: 'height:27px;float:right;margin-right:2px;border: 2px solid DeepSkyBlue;border-radius: 1px;margin-top: 5px;background-color:white;',
  setFolderButton: 'height:27px;float:right;margin-left:2px;margin-right:4px;border: 2px solid DeepSkyBlue;border-radius: 1px;margin-top: 5px;background-color:white;',
};

let saveOptions = {};
let editorContentDocument,
  jsfx = null;

const loadMetaData = metaData => {
  jsfx.CurrentParams = metaData;
  jsfx.UpdateCurrentView();
  jsfx.PlayCurrent();
};

const closeWindow = () => {
  remote.getCurrentWindow().close();
};

const saveSoundEffect = () => {
  renderPathEditor();
  saveOptions = getSaveOptions(); // Recalculate basepath to save
  jsfx.UpdateDownloadLink(); //Update base64 data
  let rawData = editorContentDocument.getElementById('download').href; //store data
  rawData = rawData.replace(/^data:audio\/wav;base64,/, '');
  fs.writeFile(saveOptions.fullPath, rawData, 'base64', err => {
    ipcRenderer.send(
      'jsfx-changes-saved',
      saveOptions.fullPath,
      jsfx.CurrentParams
    );
    closeWindow();
  });
};

// we need to first declare when the window is ready to be initiated
document.addEventListener('DOMContentLoaded', function() {
  ipcRenderer.send('jsfx-ready');
});
// then trigger bellow from main, this ensures the dom is loaded
ipcRenderer.on('jsfx-open', (event, receivedOptions) => {
  const editorFrameEl = document.getElementById('jsfx-frame');
  jsfx = editorFrameEl.contentWindow;
  editorContentDocument = editorFrameEl.contentDocument;
  const presetsPanel = editorContentDocument.getElementById('presets');

  // Load metadata
  if ('jsfx' in receivedOptions.metadata) {
    loadMetaData(receivedOptions.metadata.jsfx);
  } else {
    const generateRandomSoundEffectButton = presetsPanel.childNodes[11];
    generateRandomSoundEffectButton.click(); // Simulate click on the 'Lucky' button to create a random sound effect
  }
  // load a custom header
  const pathEditorHeader = document.getElementById('path-editor-header');
  createHeader({
    parentElement: pathEditorHeader,
    editorContentDocument: document,
    saveToGDFunction: saveSoundEffect,
    cancelChangesFunction: closeWindow,
    projectPath: receivedOptions.projectPath,
    initialResourcePath: receivedOptions.resourcePath,
    extension: '.wav',
    headerStyle,
  });

  // alter the interface
  renderPathEditor();
  editorContentDocument.getElementById('jsfx').firstChild.style = 'float:top';
  const defaultTitle = editorContentDocument.getElementsByClassName('title')[0]
    .firstChild;
  defaultTitle.remove();

  presetsPanel.className = 'description';
  presetsPanel.style = 'float:left;';

  const generatorsTitle = editorContentDocument.getElementsByClassName(
    'panel-title'
  )[1].firstChild;
  generatorsTitle.data = 'Create a Random Sound Effect:';

  const description = editorContentDocument.getElementsByClassName(
    'description'
  )[0];
  description.remove();

  const libraryPanel = editorContentDocument.getElementsByClassName(
    'panel wide'
  )[0];
  libraryPanel.style = 'visibility:hidden;height:0px;width:0px';

  const defaultButtons = editorContentDocument.getElementById('control');
  defaultButtons.style = 'visibility:hidden;height:0px;width:0px';
});