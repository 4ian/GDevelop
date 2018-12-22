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
  name,
}) => {
  if (fs.existsSync(initialResourcePath)) {
    if (fs.lstatSync(initialResourcePath).isDirectory()) {
      initialResourcePath = initialResourcePath + '/NewFile' + extension;
    }
  } else {
    initialResourcePath = projectPath + '/NewFile' + extension;
  }

  initialResourcePath = path.normalize(initialResourcePath);
  const headerObject = {
    state: {
      folderPath: path.dirname(initialResourcePath),
      name: !name
        ? path.basename(initialResourcePath, path.extname(initialResourcePath))
        : path.basename(name, path.extname(name)),
      extension: !extension ? undefined : path.extname(initialResourcePath),
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
  headerObject.fileExistsLabel.textContent = '-';
  parentElement.appendChild(headerObject.fileExistsLabel);

  headerObject.saveButton = editorContentDocument.createElement('button');
  headerObject.saveButton.textContent = 'Save';
  headerObject.saveButton.style = headerStyle.saveButton;
  parentElement.appendChild(headerObject.saveButton);

  headerObject.cancelButton = editorContentDocument.createElement('button');
  headerObject.cancelButton.textContent = 'Cancel';
  headerObject.cancelButton.style = headerStyle.cancelButton;
  parentElement.appendChild(headerObject.cancelButton);

  headerObject.openFolderButton = editorContentDocument.createElement('button');
  headerObject.openFolderButton.textContent = 'Locate';
  headerObject.openFolderButton.style = headerStyle.cancelButton;
  parentElement.appendChild(headerObject.openFolderButton);

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
  const selectFolderPath = () => {
    selectBaseFolderPath(headerObject);
  };
  headerObject.saveFolderLabel.addEventListener('click', selectFolderPath);
  headerObject.setFolderButton.addEventListener('click', selectFolderPath);

  const openFolderPath = () => {
    electron.shell.openItem(headerObject.state.folderPath);
  };
  headerObject.openFolderButton.addEventListener('click', openFolderPath);

  /**
  * Disables the path editor
  */
  headerObject.disableSavePathControls = () => {
    headerObject.saveFolderLabel.removeEventListener('click', selectFolderPath);
    headerObject.nameInput.style.color = '#8bb0b2';
    headerObject.nameInput.style.border = '2px solid black';
    headerObject.nameInput.disabled = true;
    headerObject.saveFolderLabel.style.color = '#8bb0b2';
    headerObject.saveFolderLabel.title =
      'Changing the path is disabled on imported GD animations!';
    headerObject.setFolderButton.removeEventListener('click', selectFolderPath);
    headerObject.setFolderButton.style.visibility = 'hidden';
  };

  /**
  * Returns a path for a file that does not exist yet.
  * Used to avoid unwanted file overwriting.
  */
  headerObject.makeFileNameUnique = (filePath, missingExtension) => {
    if (!fileExists(filePath)) {
      return filePath;
    }
    const folderPath = path.dirname(filePath);
    const extension = path.extname(filePath) || missingExtension;
    const oldFileName = path.basename(filePath, extension);
    let appendNumber = 0;
    let newUniqueNamePath =
      folderPath + '/' + oldFileName + '-' + String(appendNumber) + extension;
    while (fileExists(newUniqueNamePath)) {
      appendNumber += 1;
      newUniqueNamePath =
        folderPath + '/' + oldFileName + '-' + String(appendNumber) + extension;
    }
    return newUniqueNamePath;
  };

  render(headerObject);
  return headerObject;
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
  // but don't do it if there is no extension (image sequence will be saved)
  if (!headerObject.state.extension) {
    return;
  }
  if (fs.existsSync(state.fullPath)) {
    headerObject.fileExistsLabel.style.color = 'red';
    headerObject.fileExistsLabel.textContent =
      state.extension + '  (Overwrite)';
  } else {
    headerObject.fileExistsLabel.style.color = 'grey';
    headerObject.fileExistsLabel.textContent = state.extension + '  (New)';
  }
};

const fileExists = path => {
  try {
    return fs.statSync(path).isFile();
  } catch (e) {
    if (e.code === 'ENOENT') {
      // no such file or directory. File really does not exist
      return false;
    }
    console.error('Exception fs.statSync (' + path + '): ' + e);
    throw e; // something else went wrong, we don't have rights, ...
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
