const electron = require('electron');
const fs = require('fs');
const path = require('path');
const remote = electron.remote;
const { dialog } = remote;

export const createPathEditorHeader = ({
  parentElement,
  editorContentDocument,
  onSaveToGd,
  onCancelChanges,
  projectPath,
  initialResourcePath,
  extension,
  headerStyle,
}) => {
  if (fs.existsSync(initialResourcePath)) {
    if (fs.lstatSync(initialResourcePath).isDirectory()) {
      initialResourcePath = initialResourcePath + '/NewFile' + extension;
    }
  } else {
    initialResourcePath = projectPath + '/NewFile' + extension;
  }

  initialResourcePath = path.normalize(initialResourcePath)
  const headerObject = {
    state: {
      folderPath: path.dirname(initialResourcePath),
      name: path.basename(initialResourcePath, path.extname(initialResourcePath)),
      extension: path.extname(initialResourcePath),
      projectBasePath: path.normalize(projectPath),
    },
  };

  const state = headerObject.state;
  // create the dom elements of the ui
  headerObject.saveFolderLabel = editorContentDocument.createElement('label');
  headerObject.saveFolderLabel.style = headerStyle.saveFolderLabel;
  headerObject.saveFolderLabel.textContent = state.folderPath;
  parentElement.appendChild(headerObject.saveFolderLabel);

  headerObject.nameInput = editorContentDocument.createElement('input');
  headerObject.nameInput.type = 'text';
  headerObject.nameInput.style = headerStyle.nameInput;
  headerObject.nameInput.value = state.name;
  parentElement.appendChild(headerObject.nameInput);

  headerObject.fileExistsLabel = editorContentDocument.createElement('label');
  headerObject.fileExistsLabel.style = headerStyle.fileExistsLabel;
  parentElement.appendChild(headerObject.fileExistsLabel);

  headerObject.saveButton = editorContentDocument.createElement('button');
  headerObject.saveButton.textContent = 'Save';
  headerObject.saveButton.style = headerStyle.saveButton;
  parentElement.appendChild(headerObject.saveButton);

  headerObject.cancelButton = editorContentDocument.createElement('button');
  headerObject.cancelButton.textContent = 'Cancel';
  headerObject.cancelButton.style = headerStyle.cancelButton;
  parentElement.appendChild(headerObject.cancelButton);

  headerObject.setFolderButton = editorContentDocument.createElement('button');
  headerObject.setFolderButton.textContent = 'Set Folder';
  headerObject.setFolderButton.style = headerStyle.setFolderButton;
  parentElement.appendChild(headerObject.setFolderButton);

  // From here on we hook the dom with the imported or local methods via event listeners
  headerObject.nameInput.addEventListener('input', () => {
    render(headerObject);
  });
  headerObject.saveButton.addEventListener('click', () => {
    onSaveToGd(headerObject);
  });
  headerObject.cancelButton.addEventListener('click', onCancelChanges);
  headerObject.saveFolderLabel.addEventListener('click', () => {
    selectBaseFolderPath(headerObject);
  });
  headerObject.setFolderButton.addEventListener('click', () => {
    selectBaseFolderPath(headerObject);
  });
  render(headerObject);
};

const render = headerObject => {
  headerObject.nameInput.value = headerObject.nameInput.value.replace(
    /[^a-zA-Z0-9_-]/g,
    ''
  ); // Don't allow the user to enter any characters that would lead to an invalid path
  const state = headerObject.state;
  state.name = headerObject.nameInput.value;
  state.baseExportPath = state.folderPath + '/' + state.name;
  state.fullPath = state.folderPath + '/' + state.name + state.extension;
  headerObject.saveFolderLabel.textContent = state.folderPath + '/';
  headerObject.saveFolderLabel.title =
    'Click to change path: \n' + state.folderPath;

  headerObject.nameInput.style.width =
    (headerObject.nameInput.value.length + 1) * 10 + 'px';
  // check if it will overwrite a file and notify the user in a subtle, but obvious way
  if (fs.existsSync(state.fullPath)) {
    headerObject.fileExistsLabel.style.color = 'red';
    headerObject.fileExistsLabel.textContent =
      state.extension + '  (Overwrite)';
  } else {
    headerObject.fileExistsLabel.style.color = 'grey';
    headerObject.fileExistsLabel.textContent = state.extension + '  (New)';
  }
};

const selectBaseFolderPath = headerObject => {
  const state = headerObject.state;
  if (!state.projectBasePath) {
    state.projectBasePath = state.folderPath;
  }
  const selectedDir = dialog.showOpenDialog(remote.getCurrentWindow(), {
    properties: ['openDirectory'],
    defaultPath: state.projectBasePath,
  });
  if (!selectedDir) {
    return;
  }
  const selectedDirPath = selectedDir[0];
  if (!selectedDirPath.startsWith(state.projectBasePath)) {
    alert(
      'Please select a folder inside your project path!\n' +
      state.projectBasePath +
      '\n\nSelected:\n' +
      selectedDirPath
    );
    return;
  }
  state.folderPath = selectedDirPath;
  render(headerObject);
};