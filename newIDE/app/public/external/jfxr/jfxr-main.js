import { createPathEditorHeader } from '../utils/path-editor.js';

const electron = require('electron');
const remote = require('@electron/remote');
const electronWindow = remote.getCurrentWindow();
const ipcRenderer = electron.ipcRenderer;

let jfxr = null;

const closeWindow = () => {
  remote.getCurrentWindow().close();
};

const loadExistingSound = externalEditorData => {
  if (externalEditorData && externalEditorData.data) {
    jfxr.getSound().parse(externalEditorData.data);
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
  loadExistingSound(externalEditorInput.externalEditorData);

  // Jfxr only reads a single resource (a single audio file).
  const resource = externalEditorInput.resources[0] || null;
  const hasExistingResource = resource && resource.name && resource.dataUrl;

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
      ipcRenderer.send('jfxr-save', {
        resources: [
          {
            name: hasExistingResource ? pathEditor.state.name : undefined,
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
    'GDevelop Sound Effects Editor (Jfxr) - ' + externalEditorInput.name
  );

  if (hasExistingResource) pathEditor.disableNameInput();

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
