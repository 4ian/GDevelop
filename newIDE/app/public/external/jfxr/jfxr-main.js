import { createPathEditorHeader } from '../utils/path-editor.js'

const electron = require('electron')
const ipcRenderer = electron.ipcRenderer
const fs = require('fs')
const remote = electron.remote

let jfxr = null

const closeWindow = () => {
  remote.getCurrentWindow().close()
}

const loadMetaData = metaData => {
  if ('jfxr' in metaData) {
    jfxr.getSound().parse(metaData.jfxr.data);
  } else {
    jfxr.applyPreset(jfxr.presets[1])
  }
}

const saveSoundEffect = pathEditor => {
  const metadata = {
    data: jfxr.getSound().serialize(),
    name: pathEditor.state.name
  }

  jfxr.synth.run().then(data => {
    var blob = new Blob([data.toWavBytes()], {
      type: 'audio/wav'
    })
    var fileReader = new FileReader()
    fileReader.onload = function () {
      fs.writeFileSync(pathEditor.state.fullPath, Buffer(new Uint8Array(this.result)))
      ipcRenderer.send('jfxr-changes-saved', pathEditor.state.fullPath, metadata)
      closeWindow()
    }
    fileReader.readAsArrayBuffer(blob)
  })
}

// Gain access to JFXR controller by using the signal that the JFXR author kindly provided.
// It gets fired upon loading of jfxr in the iframe element
const editorFrameEl = document.getElementById('jfxr-frame')
window.addEventListener('jfxrReady', (e) => {
  jfxr = e.mainCtrl;
  ipcRenderer.send('jfxr-ready');
});
// Trigger the load of Jfxr manually, to ensure the event listener "jfxrReady" is registered already
editorFrameEl.src = 'jfxr-editor/index.html'

// Called to load a sound. Should be called after the window is fully loaded.
ipcRenderer.on('jfxr-open', (event, receivedOptions) => {
  loadMetaData(receivedOptions.metadata);

  // Load a custom save file(s) header
  const pathEditorHeaderDiv = document.getElementById('path-editor-header');
  const headerStyle = {
    saveFolderLabel: 'float: left;margin-left: 2px; font-size:15px;margin-top: 10px;color:aqua',
    nameInput: 'font-family:"Courier New";height:27px;width:90px;float:left;margin-left: 2px;padding:4px;margin-top: 4px;font-size:15px;border: 2px solid #e5cd50;border-radius: 3px;background-color:black; color: #e5cd50;',
    saveButton: 'float:right;margin-left:2px;margin-right:4px;border: 2px solid white;border-radius: 1px;margin-top: 5px;background-color:white;',
    cancelButton: 'float:right;margin-right:2px;border: 2px solid white;border-radius: 1px;margin-top: 5px;background-color:white;',
    setFolderButton: 'float:right;margin-left:2px;margin-right:4px;border: 2px solid white;border-radius: 1px;margin-top: 5px;background-color:white;',
    fileExistsLabel: 'height:27px;color:blue;float: left;margin-left: 2px;margin-top: 10px; font-size:15px;'
  };
  createPathEditorHeader({
    parentElement: pathEditorHeaderDiv,
    editorContentDocument: document,
    onSaveToGd: saveSoundEffect,
    onCancelChanges: closeWindow,
    projectPath: receivedOptions.projectPath,
    initialResourcePath: receivedOptions.resourcePath,
    extension: '.wav',
    headerStyle
  });
  // Disable google analytics from collecting personal information
  editorFrameEl.contentWindow.ga('set', 'allowAdFeatures', false);
  // Alter the interface of the external editor
  const editorContentDocument = editorFrameEl.contentDocument;
  editorContentDocument.getElementsByClassName('github')[0].remove();
  // Disable inside iframe links - they break the embedding
  editorContentDocument.getElementsByClassName('titlepane column-left')[0].childNodes[0].onclick = () => {
    return false
  };
  editorContentDocument.getElementsByClassName('titlepane column-left')[0].childNodes[1].onclick = () => {
    return false
  };
})