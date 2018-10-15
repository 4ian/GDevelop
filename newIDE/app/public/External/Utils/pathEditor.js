const electron = require('electron');
const fs = require('fs');
const remote = electron.remote;
const {
    dialog
} = remote;

const headerStyle = {
    saveFolderLabel: 'height:27px;color:SlateGrey;float: left;margin-left: 2px;margin-top: 10px; font-size:15px;',
    nameInput: 'font-family:"Courier New";height:27px;width:90px;color:SlateGrey;float:left;margin-left: 2px;padding:4px;margin-top: 4px;font-size:15px;border: 2px solid #e5cd50;border-radius: 3px;  ',
    fileExistsLabel: 'height:27px;color:blue;float: left;margin-left: 2px;margin-top: 10px; font-size:15px;',

    saveButton: 'height:27px;float:right;margin-left:2px;margin-right:4px;border: 2px solid DeepSkyBlue;border-radius: 1px;margin-top: 5px;background-color:white;',
    cancelButton: 'height:27px;float:right;margin-right:2px;border: 2px solid DeepSkyBlue;border-radius: 1px;margin-top: 5px;background-color:white;',
    setFolderButton: 'height:27px;float:right;margin-left:2px;margin-right:4px;border: 2px solid DeepSkyBlue;border-radius: 1px;margin-top: 5px;background-color:white;',
};

let saveFolderLabel,
    setFolderButton,
    nameInput,
    saveButton,
    cancelButton,
    fileExistsLabel = null

export let saveOptions = {}
let projectBasePath;
export function loadHeader(parentElement, editorContentDocument, saveToGDFunction, cancelChangesFunction, projectPath, initialResourcePath, extension) {
    projectBasePath = projectPath;
    if (fs.lstatSync(initialResourcePath).isDirectory()) {
        initialResourcePath = initialResourcePath + '/NewFile' + extension
    }
    saveOptions.folderPath = initialResourcePath.substring(0, initialResourcePath.lastIndexOf('/'));
    saveOptions.name = initialResourcePath.substring(initialResourcePath.lastIndexOf('/') + 1, initialResourcePath.lastIndexOf('.')); //todo-change with name from path
    saveOptions.extension = initialResourcePath.substring(initialResourcePath.lastIndexOf('.'), initialResourcePath.length);

    saveFolderLabel = editorContentDocument.createElement('label');
    saveFolderLabel.addEventListener('click', selectBaseFolderPath);
    saveFolderLabel.style = headerStyle.saveFolderLabel;
    saveFolderLabel.textContent = saveOptions.folderPath;
    parentElement.appendChild(saveFolderLabel);

    nameInput = editorContentDocument.createElement('input');
    nameInput.oninput = updateBasePath;
    nameInput.type = 'text';
    nameInput.style = headerStyle.nameInput;
    nameInput.value = saveOptions.name;
    parentElement.appendChild(nameInput);

    fileExistsLabel = editorContentDocument.createElement('label');
    fileExistsLabel.style = headerStyle.fileExistsLabel;
    parentElement.appendChild(fileExistsLabel);

    saveButton = editorContentDocument.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.style = headerStyle.saveButton;
    parentElement.appendChild(saveButton);
    saveButton.addEventListener('click', saveToGDFunction);

    cancelButton = editorContentDocument.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style = headerStyle.cancelButton;
    parentElement.appendChild(cancelButton);
    cancelButton.addEventListener('click', cancelChangesFunction);

    setFolderButton = editorContentDocument.createElement('button');
    setFolderButton.textContent = 'Set Folder';
    setFolderButton.style = headerStyle.setFolderButton;
    parentElement.appendChild(setFolderButton);
    setFolderButton.addEventListener('click', selectBaseFolderPath);

    updateBasePath()
}

export function updateBasePath() {
    nameInput.value = nameInput.value.replace(
        /[^a-zA-Z0-9_-]/g,
        ''
    ); // Don't allow the user to enter any characters that would lead to an invalid path
    saveOptions.name = nameInput.value;
    saveOptions.baseExportPath = saveOptions.folderPath + '/' + saveOptions.name;
    saveOptions.fullPath = saveOptions.folderPath + '/' + saveOptions.name + saveOptions.extension
    saveFolderLabel.textContent = saveOptions.folderPath + '/';
    saveFolderLabel.title =
        'Click to Change path: \n' + saveOptions.folderPath;

    nameInput.style.width = ((nameInput.value.length + 1) * 10) + 'px'
    // check if it will overwrite file
    if (fs.existsSync(saveOptions.fullPath)) {
        fileExistsLabel.style.color = 'red'
        fileExistsLabel.textContent = saveOptions.extension + '  (Overwrite)';
    } else {
        fileExistsLabel.style.color = 'grey'
        fileExistsLabel.textContent = saveOptions.extension + '  (New)';
    }
};


const selectBaseFolderPath = function () {
    if (!projectBasePath) {
        projectBasePath = saveOptions.folderPath;
    }
    const selectedDir = dialog.showOpenDialog(remote.getCurrentWindow(), {
        properties: ['openDirectory'],
        defaultPath: projectBasePath,
    });
    if (!selectedDir) {
        return;
    }
    if (!selectedDir.toString().startsWith(projectBasePath)) {
        alert(
            'Please select a folder inside your project path!\n' +
            projectBasePath +
            '\n\nSelected:\n' +
            selectedDir
        );
        return;
    }
    saveOptions.folderPath = selectedDir;
    updateBasePath();
};

function disableSavePathControls() {
    saveFolderLabel.removeEventListener('click', selectBaseFolderPath);
    nameInput.style.color = '#8bb0b2';
    nameInput.style.border = '2px solid black';
    nameInput.disabled = true;
    saveFolderLabel.style.color = '#8bb0b2';
    saveFolderLabel.title =
        'Changing the path is disabled on imported GD animations!';
    setFolderButton.removeEventListener('click', selectBaseFolderPath);
    setFolderButton.style.visibility = 'hidden';
}