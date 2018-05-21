const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const path = require('path');
const fs = require('fs');
const async = require('async');
const remote = electron.remote;

const editorContentWindow = document.getElementById('piskel-frame')
  .contentWindow;
let baseExportPath;
let piskelOptions; // The options received from GDevelop

const updateFrameElements = function() {
  setTimeout(function() {
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

// Plug a callback to know when Piskel is ready
if (!editorContentWindow.piskelReadyCallbacks) {
  editorContentWindow.piskelReadyCallbacks = [];
}
editorContentWindow.piskelReadyCallbacks.push(function() {
  ipcRenderer.send('piskel-ready');
});

/**
 * Inject custom buttons in Piskel's header,
 * get rid of the new file button,
 * make animation name editable later
 */
document.getElementById('piskel-frame').onload = function() {
  const editorContentDocument = document.getElementById('piskel-frame')
    .contentDocument;
  const newButton = editorContentDocument.getElementsByClassName(
    'new-piskel-desktop button button-primary'
  )[0];
  newButton.style.display = 'none';

  const piskelAppHeader = editorContentDocument.getElementsByClassName(
    'fake-piskelapp-header'
  )[0];
  piskelAppHeader.align = 'right';

  const saveButton = editorContentDocument.createElement('button');
  saveButton.innerHTML = 'Save to GDevelop';
  saveButton.style = 'margin-left: 20px; margin-right: 10px; margin-top: 5px;';
  piskelAppHeader.appendChild(saveButton);
  saveButton.addEventListener('click', saveToGD);

  const cancelButton = editorContentDocument.createElement('button');
  cancelButton.innerHTML = 'Cancel';
  cancelButton.style = 'margin-right: 5px; margin-top: 5px;';
  piskelAppHeader.appendChild(cancelButton);
  cancelButton.addEventListener('click', cancelChanges);
};

function fileExists(path) {
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
}

/**
 * Returns a path for a file that does not exist yet.
 * Used to avoid unwanted file overwriting.
 */
function makeFileNameUnique(path) {
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
}

function readBase64ImageFile(file) {
  const bitmap = fs.readFileSync(file);
  return 'data:image/png;base64,' + bitmap.toString('base64');
}

/**
 * Save the content to the specified file
 */
function saveToFile(content, filePath, callback) {
  const reader = new FileReader();
  reader.onload = function() {
    const buffer = new Buffer(reader.result);
    fs.writeFile(filePath, buffer, {}, callback);
  };
  reader.readAsArrayBuffer(content);
}

function saveToGD() {
  const editorFrameEl = document.querySelector('#piskel-frame');
  const pskl = editorFrameEl.contentWindow.pskl;
  const layer = pskl.app.piskelController.getCurrentLayer();

  // Generate the path of the files that will be written
  const outputResources = [];
  for (let i = 0; i < pskl.app.piskelController.getFrameCount(); i++) {
    const frame = layer.getFrameAt(i);
    let exportPath = frame.originalPath;
    let resourceName = frame.originalName;
    const originalIndex = frame.originalIndex;
    const pathAlreadyUsed = outputResources.filter(
      resource => resource.path === exportPath
    ).length;

    // If a frame was made in piskel (exportPath and resourceName will be null) come up with a unique path, so as not to overwrite any existing files
    // Also prevent overwriting frames that were created via duplication of imported frames or frames with same resources
    if (!exportPath || !resourceName || pathAlreadyUsed) {
      exportPath = baseExportPath + '-' + String(i + 1) + '.png';
      exportPath = makeFileNameUnique(exportPath);
      resourceName = path.basename(exportPath);
    }

    outputResources.push({
      path: exportPath,
      name: resourceName,
      originalIndex,
    });
  }

  // Save, asynchronously, the content of each images
  async.eachOf(
    outputResources,
    function(path, index, callback) {
      const canvas = pskl.app.piskelController.renderFrameAt(index, true);
      pskl.utils.BlobUtils.canvasToBlob(canvas, function(blob) {
        saveToFile(blob, path.path, callback);
      });
    },
    function(err) {
      ipcRenderer.send('piskel-changes-saved', outputResources);
      remote.getCurrentWindow().close();
    }
  );
}

function cancelChanges() {
  remote.getCurrentWindow().close();
}

function piskelCreateAnimation(pskl, piskelOptions) {
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
}

ipcRenderer.on('piskel-load-animation', (event, receivedOptions) => {
  piskelOptions = receivedOptions;
  baseExportPath = piskelOptions.projectPath + '/' + piskelOptions.name;

  const editorFrameEl = document.querySelector('#piskel-frame');
  const pskl = editorFrameEl.contentWindow.pskl;
  if (!pskl) return;

  if (piskelOptions.resources.length === 0) {
    piskelCreateAnimation(pskl, piskelOptions);
    return;
  }
  const imageData = [];
  let maxWidth = -1;
  let maxHeight = -1;
  async.each(
    piskelOptions.resources,
    function(resource, callback) {
      const image = new Image();
      image.onload = function() {
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
    function(err) {
      // Finally load the image objects into piskel
      const piskelFile = pskl.service.ImportService.prototype.createPiskelFromImages_(
        imageData,
        piskelOptions.name,
        maxWidth,
        maxHeight,
        false
      );
      pskl.app.piskelController.setPiskel(piskelFile, {});
      pskl.app.piskelController.setFPS(piskelOptions.fps);

      // Add original path variable to imported frame objects, so we can overwrite them later when saving changes
      const layer = pskl.app.piskelController.getCurrentLayer();
      for (let i = 0; i < pskl.app.piskelController.getFrameCount(); i++) {
        layer.getFrameAt(i).originalPath =
          piskelOptions.resources[i].resourcePath;
        layer.getFrameAt(i).originalName =
          piskelOptions.resources[i].resourceName;
        layer.getFrameAt(i).originalIndex = i;
      }

      updateFrameElements();
    }
  );
});
