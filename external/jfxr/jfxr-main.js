import {
  closeWindow,
  onMessageFromParentEditor,
  sendMessageToParentEditor,
  setTitle,
} from '../utils/parent-editor-interface.js';
import { createExternalEditorHeader } from '../utils/external-editor-header.js';

let jfxr = null;

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
  sendMessageToParentEditor('external-editor-ready');
});
// Trigger the load of Jfxr manually, to ensure the event listener "jfxrReady" is registered already
editorFrameEl.src = 'jfxr-editor/index.html';

// Called to load a sound. Should be called after the window is fully loaded.
onMessageFromParentEditor('open-external-editor-input', externalEditorInput => {
  loadExistingSound(externalEditorInput.externalEditorData);

  // Jfxr only reads a single resource (a single audio file).
  const resource = externalEditorInput.resources[0] || null;

  const saveSoundEffect = async () => {
    const externalEditorData = {
      data: jfxr.getSound().serialize(),
      name: externalEditorHeader.state.name,
    };

    const data = await jfxr.synth.run();
    const blob = new Blob([data.toWavBytes()], {
      type: 'audio/wav',
    });
    const fileReader = new FileReader();
    fileReader.onload = function() {
      sendMessageToParentEditor('save-external-editor-output', {
        resources: [
          {
            name: externalEditorHeader.state.isOverwritingExistingResource
              ? externalEditorHeader.state.name
              : undefined,
            localFilePath: externalEditorHeader.state.isOverwritingExistingResource
              ? resource.localFilePath
              : undefined,
            extension: '.wav',
            dataUrl: this.result,
          },
        ],
        baseNameForNewResources: externalEditorHeader.state.name,
        externalEditorData,
      });
      closeWindow();
    };
    fileReader.readAsDataURL(blob);
  };

  // Load a custom save file(s) header
  const pathEditorHeaderDiv = document.getElementById('external-editor-header');
  const externalEditorHeader = createExternalEditorHeader({
    parentElement: pathEditorHeaderDiv,
    editorContentDocument: document,
    onSaveChanges: saveSoundEffect,
    onCancelChanges: closeWindow,
    name: externalEditorInput.name,
  });

  setTitle(
    'GDevelop Sound Effects Editor (Jfxr) - ' + externalEditorInput.name
  );

  const isOverwritingExistingResource = resource && resource.name && resource.dataUrl;
  if (isOverwritingExistingResource) externalEditorHeader.setOverwriteExistingResource();

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
