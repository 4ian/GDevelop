import { createPathEditorHeader } from '../utils/path-editor.js';

const electron = require('electron');
const remote = require('@electron/remote');
const electronWindow = remote.getCurrentWindow();
const ipcRenderer = electron.ipcRenderer;

let jfxr = null;

const closeWindow = () => {
  remote.getCurrentWindow().close();
};

const loadMetaData = externalEditorData => {
  // TODO: adapt
  if ('jfxr' in externalEditorData) {
    jfxr.getSound().parse(externalEditorData.jfxr.data);
  } else {
    jfxr.applyPreset(jfxr.presets[1]);
  }
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
ipcRenderer.on('jfxr-open', (event, externalEditorInput) => {
  loadMetaData(externalEditorInput.externalEditorData);

  // Jfxr only reads a single resource (a single audio file).
  const resource = externalEditorInput.resources[0] || null;

  const saveSoundEffect = async pathEditor => {
    const externalEditorData = {
      data: jfxr.getSound().serialize(),
      name: pathEditor.state.name,
    };

    const data = await jfxr.synth.run();
    const blob = new Blob([data.toWavBytes()], {
      type: 'audio/wav',
    });
    const fileReader = new FileReader();
    fileReader.onload = function() {
      ipcRenderer.send('jfxr-closed', {
        resources: [
          {
            name: resource ? pathEditor.state.name : undefined,
            localFilePath: resource.localFilePath,
            extension: '.wav',
            dataUrl: this.result,
          },
        ],
        baseNameForNewResources: pathEditor.state.name,
        externalEditorData,
      });
      closeWindow();
    };
    fileReader.readAsDataURL(blob);
  };

  // Load a custom save file(s) header
  const pathEditorHeaderDiv = document.getElementById('path-editor-header');
  const pathEditor = createPathEditorHeader({
    parentElement: pathEditorHeaderDiv,
    editorContentDocument: document,
    onSaveToGd: saveSoundEffect,
    onCancelChanges: closeWindow,
    name: externalEditorInput.name,
  });

  electronWindow.setTitle(
    'GDevelop Sound Effects Editor (Jfxr) - ' +
      (externalEditorInput.name || 'New sound effect')
  );

  if (resource) pathEditor.disableNameInput();

  // Disable google analytics from collecting personal information.
  editorFrameEl.contentWindow.ga('set', 'allowAdFeatures', false);

  // Alter the interface of the external editor.
  const editorContentDocument = editorFrameEl.contentDocument;
  editorContentDocument.getElementsByClassName('github')[0].remove();

  // Disable inside iframe links - they break the embedding.
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
