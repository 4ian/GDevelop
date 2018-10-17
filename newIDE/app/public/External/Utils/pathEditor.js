const electron = require('electron');
const fs = require('fs');
const remote = electron.remote;
const {
  dialog
} = remote;

export function createPathEditorHeader({
  parentElement,
  editorContentDocument,
  saveToGDFunction,
  cancelChangesFunction,
  projectPath,
  initialResourcePath,
  extension,
  headerStyle,
}) {
  if (fs.lstatSync(initialResourcePath).isDirectory()) {
    initialResourcePath = initialResourcePath + '/NewFile' + extension;
  }

  const headerObject = {
    saveOptions: {
      folderPath: initialResourcePath.substring(
        0,
        initialResourcePath.lastIndexOf('/')
      ),
      name: initialResourcePath.substring(
        initialResourcePath.lastIndexOf('/') + 1,
        initialResourcePath.lastIndexOf('.')
      ),
      extension: initialResourcePath.substring(
        initialResourcePath.lastIndexOf('.'),
        initialResourcePath.length
      ),
      projectBasePath: projectPath,
    }
  };

  // create the dom elements of the ui
  headerObject.saveFolderLabel = editorContentDocument.createElement('label');
  headerObject.saveFolderLabel.style = headerStyle.saveFolderLabel;
  headerObject.saveFolderLabel.textContent = headerObject.saveOptions.folderPath;
  parentElement.appendChild(headerObject.saveFolderLabel);

  headerObject.nameInput = editorContentDocument.createElement('input');
  headerObject.nameInput.type = 'text';
  headerObject.nameInput.style = headerStyle.nameInput;
  headerObject.nameInput.value = headerObject.saveOptions.name;
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
  headerObject.cancelButton.addEventListener('click', cancelChangesFunction);

  headerObject.setFolderButton = editorContentDocument.createElement('button');
  headerObject.setFolderButton.textContent = 'Set Folder';
  headerObject.setFolderButton.style = headerStyle.setFolderButton;
  parentElement.appendChild(headerObject.setFolderButton);


  // From here on we hook the dom with the imported or local methods via event listeners
  headerObject.nameInput.addEventListener('input', () => {
    renderPathEditor(headerObject)
  });
  headerObject.saveButton.addEventListener('click', () => {
    saveToGDFunction(headerObject)
  });
  headerObject.saveFolderLabel.addEventListener('click', () => {
    selectBaseFolderPath(headerObject)
  });
  headerObject.setFolderButton.addEventListener('click', () => {
    selectBaseFolderPath(headerObject)
  });
  renderPathEditor(headerObject);
  return headerObject //just in case it needs to be accessed from outside, we are returning it here
}

function renderPathEditor(headerObject) {
  headerObject.nameInput.value = headerObject.nameInput.value.replace(/[^a-zA-Z0-9_-]/g, ''); // Don't allow the user to enter any characters that would lead to an invalid path
  headerObject.saveOptions.name = headerObject.nameInput.value;
  headerObject.saveOptions.baseExportPath = headerObject.saveOptions.folderPath + '/' + headerObject.saveOptions.name;
  headerObject.saveOptions.fullPath =
    headerObject.saveOptions.folderPath + '/' + headerObject.saveOptions.name + headerObject.saveOptions.extension;
  headerObject.saveFolderLabel.textContent = headerObject.saveOptions.folderPath + '/';
  headerObject.saveFolderLabel.title = 'Click to change path: \n' + headerObject.saveOptions.folderPath;

  headerObject.nameInput.style.width = (headerObject.nameInput.value.length + 1) * 10 + 'px';
  // check if it will overwrite a file and notify the user in a subtle, but obvious way
  if (fs.existsSync(headerObject.saveOptions.fullPath)) {
    headerObject.fileExistsLabel.style.color = 'red';
    headerObject.fileExistsLabel.textContent = headerObject.saveOptions.extension + '  (Overwrite)';
  } else {
    headerObject.fileExistsLabel.style.color = 'grey';
    headerObject.fileExistsLabel.textContent = headerObject.saveOptions.extension + '  (New)';
  }
};

export const getSaveOptions = (headerObject) => {
  return headerObject.saveOptions;
}

const selectBaseFolderPath = (headerObject) => {
  if (!headerObject.saveOptions.projectBasePath) {
    headerObject.saveOptions.projectBasePath = headerObject.saveOptions.folderPath;
  }
  const selectedDir = dialog.showOpenDialog(remote.getCurrentWindow(), {
    properties: ['openDirectory'],
    defaultPath: headerObject.saveOptions.projectBasePath,
  });
  if (!selectedDir) {
    return;
  }
  if (!selectedDir.toString().startsWith(headerObject.saveOptions.projectBasePath)) {
    alert(
      'Please select a folder inside your project path!\n' +
      headerObject.saveOptions.projectBasePath +
      '\n\nSelected:\n' +
      selectedDir
    );
    return;
  }
  headerObject.saveOptions.folderPath = selectedDir;
  renderPathEditor(headerObject);
};

function disableSavePathControls(headerObject, selectBaseFolderPath) {
  headerObject.saveFolderLabel.removeEventListener('click', selectBaseFolderPath);
  headerObject.nameInput.style.color = '#8bb0b2';
  headerObject.nameInput.style.border = '2px solid black';
  headerObject.nameInput.disabled = true;
  headerObject.saveFolderLabel.style.color = '#8bb0b2';
  headerObject.saveFolderLabel.title =
    'Changing the path is disabled on imported GD animations!';
  headerObject.setFolderButton.removeEventListener('click', selectBaseFolderPath);
  headerObject.setFolderButton.style.visibility = 'hidden';
}