const electron = require('electron');
const fs = require('fs');
const path = require('path');
const remote = require('@electron/remote');
const { dialog } = remote;

export const createPathEditorHeader = ({
  parentElement,
  editorContentDocument,
  onSaveToGd,
  onCancelChanges,
  projectPath,
  initialResourcePath,
  extension,
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
      visible: true,
    },
  };

  const state = headerObject.state;
  headerObject.root = editorContentDocument.createElement('span');
  headerObject.root.className = 'leftSide';
  parentElement.appendChild(headerObject.root);

  headerObject.rightButtons = editorContentDocument.createElement('span');
  parentElement.appendChild(headerObject.rightButtons);
  headerObject.rightButtons.className = 'rightButtons';

  // create the dom elements of the ui
  headerObject.saveFolderLabel = editorContentDocument.createElement('label');
  headerObject.saveFolderLabel.textContent = state.folderPath;
  headerObject.root.appendChild(headerObject.saveFolderLabel);

  headerObject.nameInput = editorContentDocument.createElement('input');
  headerObject.nameInput.type = 'text';
  headerObject.nameInput.value = state.name;
  headerObject.root.appendChild(headerObject.nameInput);

  headerObject.fileExistsLabel = editorContentDocument.createElement('label');
  headerObject.fileExistsLabel.textContent = '-';
  headerObject.root.appendChild(headerObject.fileExistsLabel);

  headerObject.hideButton = editorContentDocument.createElement('button');
  headerObject.hideButton.textContent = headerObject.state.visible ? '>' : '<';
  parentElement.appendChild(headerObject.hideButton);

  headerObject.saveButton = editorContentDocument.createElement('button');
  headerObject.saveButton.textContent = 'Save';
  headerObject.rightButtons.appendChild(headerObject.saveButton);

  headerObject.cancelButton = editorContentDocument.createElement('button');
  headerObject.cancelButton.textContent = 'Cancel';
  headerObject.rightButtons.appendChild(headerObject.cancelButton);

  headerObject.openFolderButton = editorContentDocument.createElement('button');
  headerObject.openFolderButton.textContent = 'Locate';
  headerObject.rightButtons.appendChild(headerObject.openFolderButton);

  headerObject.setFolderButton = editorContentDocument.createElement('button');
  headerObject.setFolderButton.textContent = 'Set Folder';
  headerObject.rightButtons.appendChild(headerObject.setFolderButton);

  // From here on we hook the dom with the imported or local methods via event listeners
  headerObject.nameInput.addEventListener('input', () => {
    render(headerObject);
  });
  headerObject.saveButton.addEventListener('click', () => {
    onSaveToGd(headerObject);
  });
  /**
   * Toggles the path editor
   */
  headerObject.toggle = () => {
    headerObject.state.visible = !headerObject.state.visible;
    render(headerObject);
  };
  headerObject.hideButton.addEventListener('click', () => {
    headerObject.toggle();
    render(headerObject);
  });
  headerObject.cancelButton.addEventListener('click', onCancelChanges);
  const selectFolderPath = () => {
    selectBaseFolderPath(headerObject);
  };
  headerObject.saveFolderLabel.addEventListener('click', selectFolderPath);
  headerObject.setFolderButton.addEventListener('click', selectFolderPath);

  const openFolderPath = () => {
    electron.shell.openPath(headerObject.state.folderPath);
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
    headerObject.setFolderButton.style.display = 'none';
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
  const pathEditorVisibility = headerObject.state.visible
    ? 'display:visible'
    : 'display:none;';
  headerObject.rightButtons.style = pathEditorVisibility;
  headerObject.root.style = pathEditorVisibility;

  headerObject.hideButton.textContent = headerObject.state.visible
    ? '>'
    : '...';

  headerObject.hideButton.title = headerObject.state.visible
    ? 'Hide save path options'
    : 'Open save path options';

  headerObject.hideButton.style = headerObject.state.visible
    ? 'opacity: 1; margin-right: 3px;'
    : 'opacity:0.5';

  headerObject.root.parentElement.style = headerObject.state.visible
    ? 'position: relative; display:flex; width:100%'
    : 'position: absolute; display:flex; width:40px; height:40px; right:0';

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

export const fileExists = path => {
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
  const selectedDir = dialog.showOpenDialogSync(remote.getCurrentWindow(), {
    properties: ['openDirectory'],
    defaultPath: state.projectBasePath,
  });
  if (!selectedDir || !selectedDir.length) {
    return;
  }
  const selectedDirPath = selectedDir[0];
  if (!selectedDirPath.startsWith(state.projectBasePath)) {
    dialog.showMessageBoxSync(remote.getCurrentWindow(), {
      message:
        'Please select a folder inside your project path!\n' +
        state.projectBasePath +
        '\n\nSelected:\n' +
        selectedDirPath,
      buttons: ['OK'],
    });
    return;
  }
  state.folderPath = selectedDirPath;
  render(headerObject);
};
