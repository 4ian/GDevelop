import {
  closeWindow,
  onMessageFromParentEditor,
  sendMessageToParentEditor,
  setTitle,
} from '../utils/parent-editor-interface.js';
import { createExternalEditorHeader } from '../utils/external-editor-header.js';
import { fromByteArray } from '../utils/base64.js';

let yarn = null;

function convertJsonStringToDataUrl(jsonString) {
  const base64 = fromByteArray(new TextEncoder().encode(jsonString));
  return `data:application/json;base64,${base64}`;
}

const editorFrameEl = document.getElementById('yarn-frame');
window.addEventListener('yarnReady', e => {
  yarn = e;
  yarn.data.restoreFromLocalStorage(false);
  sendMessageToParentEditor('external-editor-ready');
});
editorFrameEl.src = 'yarn-editor/index.html';

// Called to load yarn data. Should be called after the window is fully loaded.
onMessageFromParentEditor(
  'open-external-editor-input',
  async externalEditorInput => {
    const resource = externalEditorInput.resources[0] || null;

    const saveAndClose = () => {
      const jsonString = yarn.data.getSaveData('json');
      const dataUrl = convertJsonStringToDataUrl(jsonString);
      const { state } = externalEditorHeader;

      sendMessageToParentEditor('save-external-editor-output', {
        resources: [
          {
            name: state.isOverwritingExistingResource ? state.name : undefined,
            localFilePath: state.isOverwritingExistingResource
              ? resource.localFilePath
              : undefined,
            extension: '.json',
            dataUrl,
          },
        ],
        baseNameForNewResources: state.name,
        externalEditorData: null,
      });
      closeWindow();
    };

    // Make the header.
    const pathEditorHeaderDiv = document.getElementById(
      'external-editor-header'
    );
    const externalEditorHeader = createExternalEditorHeader({
      parentElement: pathEditorHeaderDiv,
      editorContentDocument: document,
      onSaveChanges: saveAndClose,
      onCancelChanges: closeWindow,
      name: externalEditorInput.name,
    });

    // Inject custom Apply button.
    const saveToGdButton = yarn.document
      .getElementsByClassName('search-tags')[0]
      .cloneNode(true);
    saveToGdButton.onclick = () => saveAndClose();
    yarn.document
      .getElementsByClassName('search-tags')[0]
      .parentElement.appendChild(saveToGdButton);
    saveToGdButton.childNodes[0].checked = 'checked';
    saveToGdButton.childNodes[2].innerHTML = 'Apply';
    saveToGdButton.childNodes[2].style = 'background-color: white;';
    yarn.document.getElementsByClassName('app-search')[0].style = 'right: 45px';
    saveToGdButton.style = 'padding-left: 30px;';

    yarn.data.editingPath('');
    yarn.data.editingType('json');

    const isOverwritingExistingResource =
      resource && resource.name && resource.dataUrl;
    if (isOverwritingExistingResource) {
      try {
        const response = await fetch(resource.dataUrl);
        const resourceData = await response.json();
        yarn.data.loadData(JSON.stringify(resourceData), 'json', true);
        externalEditorHeader.setOverwriteExistingResource();
      } catch (error) {
        console.error('Error while loading the resource - ignoring it.', error);
      }
    }
    setTitle(
      'GDevelop Dialogue Tree Editor (Yarn) - ' + externalEditorInput.name
    );
  }
);
