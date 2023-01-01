import { createPathEditorHeader } from '../utils/path-editor.js';
const electron = require('electron');
const remote = require('@electron/remote');
const electronWindow = remote.getCurrentWindow();
const ipcRenderer = electron.ipcRenderer;
const async = require('async');

const closeWindow = () => {
  remote.getCurrentWindow().close();
};

// Repeatedly try to gain access to piskel's control element and its methods
// When succeeded, stop trying.
const editorFrameEl = document.getElementById('piskel-frame');
let pskl = document.querySelector('#piskel-frame').contentWindow.pskl;
editorFrameEl.onload = () => {
  const tryToGetPiskel = () => {
    pskl = document.querySelector('#piskel-frame').contentWindow.pskl;
    if (typeof pskl === 'object') {
      ipcRenderer.send('piskel-ready');
      clearInterval(retryToGetPiskel);
    }
  };
  let retryToGetPiskel = setInterval(tryToGetPiskel, 100);
};
editorFrameEl.src = 'piskel-editor/index.html';

const saveToGD = async pathEditor => {
  const editorFrameEl = document.querySelector('#piskel-frame');
  const pskl = editorFrameEl.contentWindow.pskl;
  const layer = pskl.app.piskelController.getLayerAt(0);

  const resources = [];
  for (let i = 0; i < pskl.app.piskelController.getFrameCount(); i++) {
    const frame = layer.getFrameAt(i);
    const name = frame.originalResourceName;
    const localFilePath = frame.originalLocalFilePath;
    const originalIndex = frame.originalIndex;

    const canvas = pskl.app.piskelController.renderFrameAt(i, true);
    const dataUrl = canvas.toDataURL('image/png');

    // If a frame was made in piskel, "name" will be undefined.
    resources.push({
      name,
      dataUrl,
      localFilePath,
      originalIndex,
      extension: '.png',
    });
  }

  // If more than one layer is used - use metadata for storing the data
  let externalEditorData = {};
  const piskelData = pskl.app.piskelController.getPiskel();
  if (piskelData.layers.length > 1) {
    externalEditorData = {
      data: pskl.utils.serialization.Serializer.serialize(piskelData),
      resourceNames: resources.map(({ name }) => name),
      name: pathEditor.state.name,
    };
  }

  ipcRenderer.send('piskel-save', {
    resources,
    baseNameForNewResources: pathEditor.state.name,
    externalEditorData,
  });
  closeWindow();
};

// Create an empty piskel document to satisfy initiation when no data is given
const piskelCreateAnimation = () => {
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
  pskl.utils.serialization.Deserializer.deserialize(sprite, piskel => {
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

// Load flattened images into Piskel
const loadImagesIntoPiskel = externalEditorOutput => {
  // If no resources are being loaded, create a new animation
  if (externalEditorOutput.resources.length === 0) {
    piskelCreateAnimation();
    return;
  }
  const piskelController = pskl.app.piskelController;
  piskelController.setFPS(externalEditorOutput.fps);
  const imageData = [];
  let maxWidth = -1;
  let maxHeight = -1;
  async.each(
    externalEditorOutput.resources,
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
        image.src = resource.dataUrl;
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
        externalEditorOutput.name,
        maxWidth,
        maxHeight,
        false
      );
      piskelController.setPiskel(piskelFile, {});

      // Add original path variable to imported frame objects, so we can overwrite them later when saving changes
      const layer = piskelController.getLayerAt(0);
      for (let i = 0; i < piskelController.getFrameCount(); i++) {
        layer.getFrameAt(i).originalLocalFilePath =
          externalEditorOutput.resources[i].localFilePath;
        layer.getFrameAt(i).originalResourceName =
          externalEditorOutput.resources[i].name;
        layer.getFrameAt(i).originalIndex = i;
      }
    }
  );
};

// Load Layered Piskel document that was stored in GD as metadata
const loadPiskelDataFromGd = externalEditorInput => {
  const piskelController = pskl.app.piskelController;
  piskelController.setFPS(externalEditorInput.fps);

  const editorResourceNames =
    externalEditorInput.externalEditorData.resourceNames;
  let receivedPiskelData;
  try {
    receivedPiskelData = JSON.parse(
      externalEditorInput.externalEditorData.data
    );
  } catch (e) {
    console.error(e);
    console.info('Parsing json failed. Loading flattened images instead...');
    loadImagesIntoPiskel(externalEditorInput);
    return;
  }

  // Create a Piskel Document from the metadata that GD stores
  pskl.utils.serialization.Deserializer.deserialize(
    receivedPiskelData,
    piskel => {
      piskelController.setPiskel(piskel);

      // set piskel frame resourceNames to their piskel data counterpart - on all layers
      piskelController.getLayers().forEach(layer => {
        layer.getFrames().forEach((frame, index) => {
          frame.originalResourceName = editorResourceNames[index];
          frame.originalIndex = index;
        });
      });

      // Compare the imported frames - so as to make the layered Piskel Document
      // the same as the changes done in Gdevelop without flattening any layers
      let flattenedResourceNames = [];
      externalEditorInput.resources.forEach((resource, frameIndex) => {
        const resourceName = resource.name;
        flattenedResourceNames.push(resourceName);

        // Import any frames that were added in Gdevelop
        if (!editorResourceNames.includes(resourceName)) {
          pskl.utils.BlobUtils.dataToBlob(
            resource.dataUrl,
            'image/png',
            imageBlob => {
              pskl.utils.FileUtils.readImageFile(imageBlob, image => {
                piskelController.setCurrentFrameIndex(
                  piskelController.getFrameCount() - 1
                );

                piskelController.addFrameAtCurrentIndex();
                piskelController.selectNextFrame();
                const currentFrameObj = piskelController.getCurrentFrame();
                pskl.utils.FrameUtils.addImageToFrame(
                  currentFrameObj,
                  image,
                  0,
                  0
                );
                pskl.tools.transform.TransformUtils.center(currentFrameObj);

                piskelController.getLayers().forEach(layer => {
                  layer.moveFrame(
                    piskelController.getCurrentFrameIndex(),
                    frameIndex
                  );
                  layer.getFrameAt(frameIndex).originalIndex = frameIndex;
                  layer.getFrameAt(
                    frameIndex
                  ).originalResourceName = resourceName;
                });
              });
            }
          );
        }
      });

      // Remove any frames that were removed in GD
      let framesToDelete = [];
      piskelController
        .getLayers()[0]
        .getFrames()
        .forEach(frame => {
          // The frame was in metadata, but is not in GDevelop frames, if so remove it
          if (
            editorResourceNames.includes(frame.originalResourceName) &&
            !flattenedResourceNames.includes(frame.originalResourceName)
          ) {
            framesToDelete.push(frame);
          }
        });
      framesToDelete.forEach(frameToDelete => {
        const layer = piskelController.getLayers()[0];
        const removeFrameIndex = layer.getFrames().indexOf(frameToDelete);
        if (removeFrameIndex !== -1) {
          // Always keep the frame count at 1 or above by inserting an empty frame if we're reaching 0 - as Piskel does not support having no frames
          if (piskelController.getFrameCount() === 1) {
            piskelController.setCurrentFrameIndex(
              piskelController.getFrameCount() - 1
            );
            piskelController.addFrameAtCurrentIndex();
          }

          piskelController.removeFrameAt(removeFrameIndex);
        }
      });

      // Put frames in the same order as they were in GD
      piskelController.getLayers().forEach(layer => {
        layer.getFrames().sort((a, b) => {
          return (
            flattenedResourceNames.indexOf(a.originalResourceName) -
            flattenedResourceNames.indexOf(b.originalResourceName)
          );
        });
      });
    },
    // If Piskel serializer fails to deserialize, revert to loading flattened images
    error => {
      console.error(error);
      console.info(
        'Loading piskel data failed. Loading flattened images instead...'
      );
      loadImagesIntoPiskel(externalEditorInput);
    }
  );
};

/**
 * Inject custom buttons in Piskel's header,
 * get rid of the new file button,
 * make animation name and path editable
 */
ipcRenderer.on('piskel-open', (event, externalEditorInput) => {
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
  const savePathEditor = createPathEditorHeader({
    parentElement: pathEditorHeaderDiv,
    editorContentDocument: document,
    onSaveToGd: saveToGD,
    onCancelChanges: closeWindow,
    name: externalEditorInput.name,
  });

  if (!pskl) {
    return;
  }
  // Set piskel to tiled mode when editing a singleFrame object
  pskl.UserSettings.set(
    pskl.UserSettings.SEAMLESS_MODE,
    externalEditorInput.singleFrame
  );

  electronWindow.setTitle(
    'GDevelop Pixel Editor (Piskel) - ' + externalEditorInput.name
  );

  // If there were no resources sent by GD, create an empty piskel document
  if (externalEditorInput.resources.length === 0) {
    piskelCreateAnimation();
  } else if (externalEditorInput.externalEditorData) {
    // If there is metadata from GD, use it to load the pskl document with frames with layers
    // Note that metadata will be saved only if the user has more than one layers
    loadPiskelDataFromGd(externalEditorInput);
  } else {
    // If there are resources, but no metadata, load the images that were received from GD
    loadImagesIntoPiskel(externalEditorInput);
    // Disable changing path and naming convention by user - on animations imported from gdevelop
    savePathEditor.disableNameInput();
  }

  setTimeout(() => {
    const editorContentDocument = document.getElementById('piskel-frame')
      .contentDocument;
    if (externalEditorInput.singleFrame) {
      editorContentDocument.getElementsByClassName(
        'preview-list-wrapper'
      )[0].style.display = 'none';
    }
  });
});
