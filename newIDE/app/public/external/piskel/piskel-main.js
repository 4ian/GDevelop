import { createPathEditorHeader } from '../utils/path-editor.js';
const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const fs = require('fs');
const async = require('async');
const path = require('path');
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
  const layer = pskl.app.piskelController.getLayerAt(0);
  // Generate the path of the files that will be written
  const outputResources = [];
  const outputPaths = [];
  for (let i = 0; i < pskl.app.piskelController.getFrameCount(); i++) {
    const frame = layer.getFrameAt(i);
    let exportPath = frame.originalPath;
    const originalIndex = frame.originalIndex;

    // If a frame was made in piskel (exportPath and resourceName will be null) come up with a unique path, so as not to overwrite any existing files
    // Also prevent overwriting frames that were created via duplication of imported frames or frames with same resources
    if (!exportPath) {
      exportPath =
        pathEditor.state.folderPath +
        '/' +
        pathEditor.state.name +
        '-' +
        String(i + 1) +
        '.png';
      exportPath = pathEditor.makeFileNameUnique(exportPath, '.png');
    }

    exportPath = path.normalize(exportPath);
    outputResources.push({
      path: exportPath,
      originalIndex,
    });

    outputPaths.push(exportPath);
  }
  // if more than one layer is used - use metadata for storing the data
  let metadata = {};
  const piskelData = pskl.app.piskelController.getPiskel();
  if (piskelData.layers.length > 1) {
    //TODO - also do if more than one palette detected
    metadata = {
      data: pskl.utils.serialization.Serializer.serialize(piskelData),
      paths: outputPaths,
      name: pathEditor.state.name,
      isTiled: piskelOptions.isTiled,
    };
  }

  // Save, asynchronously, the content of each images
  async.eachOf(
    outputResources,
    (path, index, callback) => {
      const canvas = pskl.app.piskelController.renderFrameAt(index, true);
      pskl.utils.BlobUtils.canvasToBlob(canvas, function (blob) {
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
  pskl.utils.serialization.Deserializer.deserialize(sprite, function (piskel) {
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
    saveFolderLabel: 'float: left;margin-left: 2px; font-size:15px;margin-top: 10px;color:aqua',
    nameInput: 'font-family:"Courier New";height:27px;width:90px;float:left;margin-left: 2px;padding:4px;margin-top: 4px;font-size:15px;border: 2px solid #e5cd50;border-radius: 3px;background-color:black; color: #e5cd50;',
    saveButton: 'float:right;margin-left:2px;margin-right:4px;border: 2px solid white;border-radius: 1px;margin-top: 5px;background-color:white;',
    cancelButton: 'float:right;margin-right:2px;border: 2px solid white;border-radius: 1px;margin-top: 5px;background-color:white;',
    setFolderButton: 'float:right;margin-left:2px;margin-right:4px;border: 2px solid white;border-radius: 1px;margin-top: 5px;background-color:white;',
    fileExistsLabel: 'height:27px;color:aqua;float: left;margin-left: 2px;margin-top: 10px; font-size:15px;',
  };
  const savePathEditor = createPathEditorHeader({
    parentElement: pathEditorHeaderDiv,
    editorContentDocument: document,
    onSaveToGd: saveToGD,
    onCancelChanges: cancelChanges,
    projectPath: receivedOptions.projectPath,
    initialResourcePath: receivedOptions.resources[0] === undefined ?
      '' : receivedOptions.resources[0].resourcePath,
    extension: '',
    headerStyle,
    name: receivedOptions.name,
  });

  // Get controller again
  piskelOptions = receivedOptions;
  const editorFrameEl = document.querySelector('#piskel-frame');
  pskl = editorFrameEl.contentWindow.pskl;
  if (!pskl) {
    return;
  }

  // Set piskel to tiled mode when editing a tiled object, set FPS from GD
  pskl.UserSettings.set(pskl.UserSettings.SEAMLESS_MODE, piskelOptions.isTiled);
  const piskelController = pskl.app.piskelController;
  piskelController.setFPS(piskelOptions.fps);

  // if no resources are being loaded, create a new animation
  if (
    piskelOptions.resources.length === 0 &&
    !(piskelOptions.metadata.pskl)
  ) {
    piskelCreateAnimation(pskl, piskelOptions);
    return;
  }

  // If there is metadata, use it to load the frames with layers
  // Note that metadata will be saved only if the user has more than one layers
  if (piskelOptions.metadata.pskl) {
    const metadataPaths = piskelOptions.metadata.pskl.paths;

    // Create a Piskel Document from the metadata that GD stores
    pskl.utils.serialization.Deserializer.deserialize(
      JSON.parse(piskelOptions.metadata.pskl.data),
      piskel => {

        piskelController.setPiskel(piskel);
        // set piskel frame paths to their piskel data counterpart - on all layers
        for (let i = 0; i < piskelController.getFrameCount(); i++) { 
          for (let li = 0; li < piskelController.getLayers().length; li++) {
            piskelController.getLayerAt(li).getFrameAt(i).originalPath = metadataPaths[i];
            piskelController.getLayerAt(li).getFrameAt(i).originalIndex = i;
          }
        };

        // Compare the imported frames - so as to make the layered Piskel Document
        // the same as the changes done in Gdevelop without flattening any layers
        let flattenedImagePaths = [];
        piskelOptions.resources.forEach((resource, frameIndex) => {
          const flattenedFramePath = path.normalize(resource.resourcePath)
          flattenedImagePaths.push(flattenedFramePath);

          // Import any frames that were added in Gdevelop
          if (!metadataPaths.includes(flattenedFramePath)) {
            pskl.utils.BlobUtils.dataToBlob(readBase64ImageFile(flattenedFramePath), 'image/png', imageBlob => {
              pskl.utils.FileUtils.readImageFile(imageBlob, image => {
                piskelController.setCurrentFrameIndex(piskelController.getFrameCount() - 1)

                piskelController.addFrameAtCurrentIndex();
                piskelController.selectNextFrame();
                const currentFrameObj = piskelController.getCurrentFrame();
                pskl.utils.FrameUtils.addImageToFrame(currentFrameObj, image, 0, 0);
                pskl.tools.transform.TransformUtils.center(currentFrameObj);
                currentFrameObj.originalPath = flattenedFramePath;
                currentFrameObj.originalIndex = frameIndex;

                for (let li = 0; li < piskelController.getLayers().length; li++) {
                  piskelController.getLayerAt(li).moveFrame(piskelController.getCurrentFrameIndex(), frameIndex);
                };
              });
            });
          };
        });

        // Remove any frames that were removed in GD
        const layer = piskelController.getLayerAt(0);
        metadataPaths.forEach((metaFramePath, index) => {
          if (!flattenedImagePaths.includes(metaFramePath)) {
            for (let fi = 0; fi < piskelController.getFrameCount(); fi++) {
              if (metaFramePath === layer.getFrameAt(fi).originalPath) {
                for (let li = 0; li < piskelController.getLayers().length; li++) {
                  piskelController.getLayerAt(li).removeFrameAt(fi)
                }
              }
            }
          }
        });
        
        // Apply any moving of frames in GD to existing frames
        for (let fi = 0; fi < piskelController.getFrameCount(); fi++) {
          const moveTo = flattenedImagePaths.indexOf(layer.getFrameAt(fi).originalPath)
          if (moveTo !== -1){
            for (let li = 0; li < piskelController.getLayers().length; li++) {
              piskelController.getLayerAt(li).moveFrame(fi, moveTo);
              piskelController.getLayerAt(li).getFrameAt(moveTo).originalIndex = moveTo;
            }
          }
        };
    });
  } else {
    // Load flat images into piskel if there is no metadata - the old way
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
        piskelController.setPiskel(piskelFile, {});

        // Add original path variable to imported frame objects, so we can overwrite them later when saving changes
        const layer = piskelController.getLayerAt(0);
        for (let i = 0; i < piskelController.getFrameCount(); i++) {
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
  }
  updateFrameElements();
});