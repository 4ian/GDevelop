import { createPathEditorHeader } from '../utils/path-editor.js';
const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const fs = require('fs');
const async = require('async');
const remote = electron.remote;

let piskelOptions; // The options received from GDevelop
const updateFrameElements = () => {
  setTimeout(() => {
    const editorContentDocument = document.getElementById('piskel-frame')
      .contentDocument;
    if (piskelOptions.singleFrame) {
      editorContentDocument.getElementsByClassName(
        'preview-list-wrapper'
      )[0].style.display =
        'none';
    }

    //TODO: Ideally, shortcuts for duplicating a frame should also be removed.
  });
};

// Repeatedly try to gain access to piskel's control element and its methods
// When succeeding, stop trying.
let pskl = null;
const tryToGetPiskel = () => {
  if (pskl === null) {
    pskl = document.querySelector('#piskel-frame').contentWindow.pskl;
  } else {
    // gained access to control elements!
    ipcRenderer.send('piskel-ready');
    clearInterval(retryToGetPiskel);
  }
};
let retryToGetPiskel = setInterval(tryToGetPiskel, 100);

const fileExists = path => {
  try {
    return fs.statSync(path).isFile();
  } catch (e) {
    if (e.code === 'ENOENT') {
      // no such file or directory. File really does not exist
      return false;
    }
    console.log('Exception fs.statSync (' + path + '): ' + e);
    throw e; // something else went wrong, we don't have rights, ...
  }
};

/**
 * Returns a path for a file that does not exist yet.
 * Used to avoid unwanted file overwriting.
 */
const makeFileNameUnique = path => {
  if (!fileExists(path)) {
    return path;
  }

  //TODO: refactor by using `path` module and properly handle the case
  //where the file has no extension.
  const folderPath = path.substring(0, path.lastIndexOf('/') + 1);
  const extension = path.substring(path.lastIndexOf('.'), path.length);
  const oldFileName = path.substring(
    path.lastIndexOf('/') + 1,
    path.lastIndexOf('.')
  );
  let appendNumber = 0;
  let newUniqueNamePath =
    folderPath + oldFileName + '-' + String(appendNumber) + extension;
  while (fileExists(newUniqueNamePath)) {
    appendNumber += 1;
    newUniqueNamePath =
      folderPath + oldFileName + '-' + String(appendNumber) + extension;
  }
  return newUniqueNamePath;
};

const readBase64ImageFile = file => {
  const bitmap = fs.readFileSync(file);
  return 'data:image/png;base64,' + bitmap.toString('base64');
};

/**
 * Save the content to the specified file
 */
const saveToFile = (content, filePath, callback) => {
  const reader = new FileReader();
  reader.onload = () => {
    const buffer = new Buffer(reader.result);
    fs.writeFile(filePath, buffer, {}, callback);
  };
  reader.readAsArrayBuffer(content);
};

const saveToGD = pathEditor => {
  const editorFrameEl = document.querySelector('#piskel-frame');
  const pskl = editorFrameEl.contentWindow.pskl;
  const layer = pskl.app.piskelController.getCurrentLayer();
  // Generate the path of the files that will be written
  const outputResources = [];
  const outputPaths = [];
  for (let i = 0; i < pskl.app.piskelController.getFrameCount(); i++) {
    const frame = layer.getFrameAt(i);
    let exportPath = frame.originalPath;
    const originalIndex = frame.originalIndex;
    const pathAlreadyUsed = outputResources.filter(
      resource => resource.path === exportPath
    ).length;

    // If a frame was made in piskel (exportPath and resourceName will be null) come up with a unique path, so as not to overwrite any existing files
    // Also prevent overwriting frames that were created via duplication of imported frames or frames with same resources
    if (!exportPath || pathAlreadyUsed) {
      exportPath = pathEditor.state.folderPath + '/' + pathEditor.state.name + '-' + String(i + 1) + '.png';
      exportPath = makeFileNameUnique(exportPath);
    }

    outputResources.push({
      path: exportPath,
      originalIndex,
    });
    outputPaths.push(
      exportPath
    )
  }

  // if more than one layer is used - use metadata for storing the data
  let metadata = {};
  const piskelData = pskl.app.piskelController.getPiskel();
  if (piskelData.layers.length > 1) { //TODO - also do if more than one palette detected
    metadata = {
      data: pskl.utils.serialization.Serializer.serialize(piskelData),
      paths: outputPaths,
      name: pathEditor.state.name,
    };
  };

  // Save, asynchronously, the content of each images
  async.eachOf(
    outputResources,
    (path, index, callback) => {
      const canvas = pskl.app.piskelController.renderFrameAt(index, true);
      pskl.utils.BlobUtils.canvasToBlob(canvas, function(blob) {
        saveToFile(blob, path.path, callback);
      });
    },
    err => {
      ipcRenderer.send(
        'piskel-changes-saved',
        outputResources,
        pathEditor.state.name,
        metadata
      );
      remote.getCurrentWindow().close();
    }
  );
};

const cancelChanges = () => {
  remote.getCurrentWindow().close();
};

const piskelCreateAnimation = (pskl, piskelOptions) => {
  const sprite = {
    modelVersion: 2,
    piskel: {
      name: 'New Animation',
      description: '',
      fps: 12,
      height: 64,
      width: 64,
      layers: [
        '{"name":"Layer 1","frameCount":1,"base64PNG":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAAAOUlEQVR42u3OIQEAAAACIP1/2hkWWEBzVgEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAYF3YDicAEE8VTiYAAAAAElFTkSuQmCC"}',
      ],
    },
  };

  const piskel = sprite.piskel;
  const descriptor = new pskl.model.piskel.Descriptor(
    piskel.name,
    piskel.description,
    true
  );
  pskl.utils.serialization.Deserializer.deserialize(sprite, function(piskel) {
    piskel.setDescriptor(descriptor);
    pskl.app.piskelController.setPiskel(piskel);
    pskl.app.piskelController.setFPS(sprite.fps);
  });
  pskl.app.settingsController.settingsContainer
    .getElementsByClassName('tool-icon  icon-settings-resize-white')[0]
    .click(); // call resize window
  pskl.app.settingsController.settingsContainer
    .getElementsByClassName('textfield resize-size-field')[0]
    .focus();
};

ipcRenderer.on('piskel-load-animation', (event, receivedOptions) => {
  console.log(receivedOptions)
  /**
 * Inject custom buttons in Piskel's header,
 * get rid of the new file button,
 * make animation name and path editable
 */
  const editorContentDocument = document.getElementById('piskel-frame')
    .contentDocument;
  const newButton = editorContentDocument.getElementsByClassName(
    'new-piskel-desktop button button-primary'
  )[0];
  const oldPiskelNameLabel = editorContentDocument.getElementsByClassName(
    'piskel-name'
  )[0];
  newButton.style.display = 'none';
  oldPiskelNameLabel.style.display = 'none';
  const piskelAppHeader = editorContentDocument.getElementsByClassName(
    'fake-piskelapp-header'
  )[0];
  piskelAppHeader.style.display = 'none';

  // Load a custom save file(s) header
  const pathEditorHeaderDiv = document.getElementById('path-editor-header');
  const headerStyle = {
    saveFolderLabel:
      'float: left;margin-left: 2px; font-size:15px;margin-top: 10px;color:aqua',
    nameInput:
      'font-family:"Courier New";height:27px;width:90px;float:left;margin-left: 2px;padding:4px;margin-top: 4px;font-size:15px;border: 2px solid #e5cd50;border-radius: 3px;background-color:black; color: #e5cd50;',
    saveButton:
      'float:right;margin-left:2px;margin-right:4px;border: 2px solid white;border-radius: 1px;margin-top: 5px;background-color:white;',
    cancelButton:
      'float:right;margin-right:2px;border: 2px solid white;border-radius: 1px;margin-top: 5px;background-color:white;',
    setFolderButton:
      'float:right;margin-left:2px;margin-right:4px;border: 2px solid white;border-radius: 1px;margin-top: 5px;background-color:white;',
    fileExistsLabel:
      'height:27px;color:aqua;float: left;margin-left: 2px;margin-top: 10px; font-size:15px;',
  };
  const savePathEditor = createPathEditorHeader({
    parentElement: pathEditorHeaderDiv,
    editorContentDocument: document,
    onSaveToGd: saveToGD,
    onCancelChanges: cancelChanges,
    projectPath: receivedOptions.projectPath,
    initialResourcePath:
      receivedOptions.resources[0] === undefined
        ? ''
        : receivedOptions.resources[0].resourcePath,
    extension: '',
    headerStyle,
    name: receivedOptions.name,
  });

  // Get controller again
  piskelOptions = receivedOptions;
  const editorFrameEl = document.querySelector('#piskel-frame');
  pskl = editorFrameEl.contentWindow.pskl;
  if (!pskl) { return }

  // Set piskel to tiled mode when editing a tiled object, set FPS from GD
  pskl.UserSettings.set(pskl.UserSettings.SEAMLESS_MODE, piskelOptions.isTiled);
  pskl.app.piskelController.setFPS(piskelOptions.fps);

  // if no resources are being loaded, create a new animation
  if (piskelOptions.resources.length === 0 && !('pskl' in piskelOptions.metadata)) {
    piskelCreateAnimation(pskl, piskelOptions);
    return;
  }

  // If there is metadata, use it to load the frames with layers 
  console.log(piskelOptions.metadata);
  if ('pskl' in piskelOptions.metadata) {
    pskl.utils.serialization.Deserializer.deserialize(
      JSON.parse(piskelOptions.metadata.pskl.data),
      piskel => {
        pskl.app.piskelController.setPiskel(piskel);

        // Add original path variable to imported frame objects, so we can overwrite them later when saving changes
        const layer = pskl.app.piskelController.getCurrentLayer();
        for (let i = 0; i < pskl.app.piskelController.getFrameCount(); i++) {
          layer.getFrameAt(i).originalPath =
          piskelOptions.metadata.pskl.paths[i].resourcePath;
          layer.getFrameAt(i).originalIndex = i;
        }
      }
    );
  } else { // Load images into piskel if there is no metadata
    const imageData = [];
    let maxWidth = -1;
    let maxHeight = -1;
    async.each(
      piskelOptions.resources,
      (resource, callback) => {
        const image = new Image();
        image.onload = () => {
          imageData.push(image);
          maxWidth = Math.max(image.width, maxWidth);
          maxHeight = Math.max(image.height, maxHeight);
          callback();
        };

        // onload will fire after `src` is set
        try {
          image.src = readBase64ImageFile(resource.resourcePath);
        } catch (error) {
          // Unable to load the image, ignore it.
          console.error('Unable to load ', resource, error);
          callback();
        }
      },
      err => {
        // Finally load the image objects into piskel
        const piskelFile = pskl.service.ImportService.prototype.createPiskelFromImages_(
          imageData,
          piskelOptions.name,
          maxWidth,
          maxHeight,
          false
        );
        pskl.app.piskelController.setPiskel(piskelFile, {});

        // Add original path variable to imported frame objects, so we can overwrite them later when saving changes
        const layer = pskl.app.piskelController.getCurrentLayer();
        for (let i = 0; i < pskl.app.piskelController.getFrameCount(); i++) {
          layer.getFrameAt(i).originalPath =
            piskelOptions.resources[i].resourcePath;
          layer.getFrameAt(i).originalName =
            piskelOptions.resources[i].resourceName;
          layer.getFrameAt(i).originalIndex = i;
        }
        // Disable changing path and naming convention by user - on animations imported from gdevelop
        savePathEditor.disableSavePathControls();
      }
    );
  };
  updateFrameElements();
});
