import { createPathEditorHeader } from '../utils/path-editor.js';

const electron = require('electron');
const remote = require('@electron/remote');
const electronWindow = remote.getCurrentWindow();
const ipcRenderer = electron.ipcRenderer;
const fs = require('fs');

let jfxr = null;

const closeWindow = () => {
  remote.getCurrentWindow().close();
};

const loadMetaData = externalEditorData => {
  if ('jfxr' in externalEditorData) {
    jfxr.getSound().parse(externalEditorData.jfxr.data);
  } else {
    jfxr.applyPreset(jfxr.presets[1]);
  }
};

const saveSoundEffect = pathEditor => {
  const externalEditorData = {
    data: jfxr.getSound().serialize(),
    name: pathEditor.state.name,
  };

  jfxr.synth.run().then(data => {
    var blob = new Blob([data.toWavBytes()], {
      type: 'audio/wav',
    });
    var fileReader = new FileReader();
    fileReader.onload = function() {
      fs.writeFileSync(
        pathEditor.state.fullPath,
        Buffer(new Uint8Array(this.result))
      );
      ipcRenderer.send(
        'jfxr-changes-saved',
        pathEditor.state.fullPath,
        externalEditorData
      );
      closeWindow();
    };
    fileReader.readAsArrayBuffer(blob);
  });
};

// Gain access to JFXR controller by using the signal that the JFXR author kindly provided.
// It gets fired upon loading of jfxr in the iframe element
const editorFrameEl = document.getElementById('jfxr-frame');
window.addEventListener('jfxrReady', e => {
  jfxr = e.mainCtrl;
  ipcRenderer.send('jfxr-ready');
});
// Trigger the load of Jfxr manually, to ensure the event listener "jfxrReady" is registered already
editorFrameEl.src = 'jfxr-editor/index.html';

// Called to load a sound. Should be called after the window is fully loaded.
ipcRenderer.on('jfxr-open', (event, receivedOptions) => {
  loadMetaData(receivedOptions.externalEditorData);

  // Load a custom save file(s) header
  const pathEditorHeaderDiv = document.getElementById('path-editor-header');
  createPathEditorHeader({
    parentElement: pathEditorHeaderDiv,
    editorContentDocument: document,
    onSaveToGd: saveSoundEffect,
    onCancelChanges: closeWindow,
    projectPath: receivedOptions.projectPath,
    initialResourcePath: receivedOptions.resourcePath,
    extension: '.wav',
  });

  electronWindow.setTitle(
    'GDevelop Sound Effects Editor (Jfxr) - ' +
      (receivedOptions.resourcePath
        ? receivedOptions.resourcePath
        : receivedOptions.projectPath)
  );

  // Disable google analytics from collecting personal information
  editorFrameEl.contentWindow.ga('set', 'allowAdFeatures', false);
  // Alter the interface of the external editor
  const editorContentDocument = editorFrameEl.contentDocument;
  editorContentDocument.getElementsByClassName('github')[0].remove();
  // Disable inside iframe links - they break the embedding
  editorContentDocument.getElementsByClassName(
    'titlepane column-left'
  )[0].childNodes[0].onclick = () => {
    return false;
  };
  editorContentDocument.getElementsByClassName(
    'titlepane column-left'
  )[0].childNodes[1].onclick = () => {
    return false;
  };
});
