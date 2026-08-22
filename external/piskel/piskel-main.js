import {
  closeWindow,
  onMessageFromParentEditor,
  sendMessageToParentEditor,
  setTitle,
} from '../utils/parent-editor-interface.js';
import { createExternalEditorHeader } from '../utils/external-editor-header.js';

// Repeatedly try to gain access to piskel's control element and its methods
// When succeeded, stop trying.
const editorFrameEl = document.getElementById('piskel-frame');
let pskl = document.querySelector('#piskel-frame').contentWindow.pskl;
editorFrameEl.onload = () => {
  const tryToGetPiskel = () => {
    pskl = document.querySelector('#piskel-frame').contentWindow.pskl;
    if (typeof pskl === 'object') {
      sendMessageToParentEditor('external-editor-ready');

      clearInterval(retryToGetPiskel);
    }
  };
  let retryToGetPiskel = setInterval(tryToGetPiskel, 100);
};
editorFrameEl.src = 'piskel-editor/index.html';

const saveToGDevelop = async externalEditorHeader => {
  const editorFrameEl = document.querySelector('#piskel-frame');
  const pskl = editorFrameEl.contentWindow.pskl;
  const layer = pskl.app.piskelController.getLayerAt(0);
  const { state } = externalEditorHeader;

  // Save the images to resource using data URLs to
  // send them back to GDevelop.
  const resources = [];
  for (let i = 0; i < pskl.app.piskelController.getFrameCount(); i++) {
    const frame = layer.getFrameAt(i);

    // If a frame was made in piskel, `name` and `localFilePath` will be undefined.
    // If the user chose to create a new resource, they will also be undefined.
    const name = state.isOverwritingExistingResource
      ? frame.originalResourceName
      : undefined;
    const localFilePath = state.isOverwritingExistingResource
      ? frame.originalLocalFilePath
      : undefined;
    const originalIndex = frame.originalIndex;

    const canvas = pskl.app.piskelController.renderFrameAt(i, true);
    const dataUrl = canvas.toDataURL('image/png');

    resources.push({
      name,
      dataUrl,
      localFilePath,
      originalIndex,
      extension: '.png',
    });
  }

  // If more than one layer is used, save the full Piskel data to try to preserve
  // layers.
  let externalEditorData = {};
  const piskelData = pskl.app.piskelController.getPiskel();
  if (piskelData.layers.length > 1) {
    externalEditorData = {
      // Preserve the layers in the `data`.
      data: pskl.utils.serialization.Serializer.serialize(piskelData),
      // Also save the ordered resource names to be able to restore them later.
      // (by keeping the resource names, we know if resources were moved/added/deleted).
      resourceNames: resources.map(({ name }) => name),
      name: state.name,
    };
  }

  sendMessageToParentEditor('save-external-editor-output', {
    resources,
    baseNameForNewResources: state.name,
    externalEditorData,
  });

  // Tell Piskel we saved the changes so that it does not try to prevent closing the window.
  // We could override the "Unload service" private functions - but it seems even more hacky.
  pskl.app.savedStatusService.onPiskelSaved();
  closeWindow();
};

// Create an empty piskel document to satisfy initiation when no data is given
const createEmptyAnimation = () => {
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
const loadImagesIntoPiskel = async externalEditorInput => {
  // If no resources are being loaded, create a new animation
  if (externalEditorInput.resources.length === 0) {
    createEmptyAnimation();
    return;
  }

  const piskelController = pskl.app.piskelController;
  piskelController.setFPS(externalEditorInput.fps);
  const imageData = [];
  let maxWidth = -1;
  let maxHeight = -1;

  // Load all the images into a DOM `Image`.
  await Promise.all(
    externalEditorInput.resources.map(resource => {
      return new Promise(resolve => {
        let hasAlreadyLoadedOrErrored = false;

        const image = new Image();
        image.onload = () => {
          if (hasAlreadyLoadedOrErrored) return;
          hasAlreadyLoadedOrErrored = true;

          imageData.push(image);
          maxWidth = Math.max(image.width, maxWidth);
          maxHeight = Math.max(image.height, maxHeight);
          resolve();
        };
        image.onerror = event => {
          if (hasAlreadyLoadedOrErrored) return;
          hasAlreadyLoadedOrErrored = true;
          console.error('Unable to load ', resource, event);
          resolve();
        };

        try {
          // `onload` (or `onerror`) will fire after `src` is set.
          image.src = resource.dataUrl;
        } catch (error) {
          if (hasAlreadyLoadedOrErrored) return;
          hasAlreadyLoadedOrErrored = true;

          // Unable to load the image, ignore it.
          console.error('Unable to load ', resource, error);
          resolve();
        }
      });
    })
  );

  // Finally load the `Image` objects into Piskel.
  const piskelFile = pskl.service.ImportService.prototype.createPiskelFromImages_(
    imageData,
    externalEditorInput.name,
    maxWidth,
    maxHeight,
    false
  );
  piskelController.setPiskel(piskelFile, {});

  // Add original path variable to imported frame objects, so we can overwrite them later when saving changes.
  const layer = piskelController.getLayerAt(0);
  for (let i = 0; i < piskelController.getFrameCount(); i++) {
    const frame = layer.getFrameAt(i);
    frame.originalLocalFilePath =
      externalEditorInput.resources[i].localFilePath;
    frame.originalResourceName = externalEditorInput.resources[i].name;
    frame.originalIndex = i;
  }
};

// Load Layered Piskel document that was stored in GD as metadata
const loadPiskelDataFromGd = externalEditorInput => {
  const piskelController = pskl.app.piskelController;
  piskelController.setFPS(externalEditorInput.fps);

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

  // Get back the resource names and local file paths, if any,
  // previously saved when editing these.
  const savedResourceNames =
    externalEditorInput.externalEditorData.resourceNames;

  if (!savedResourceNames) {
    console.info('Missing resourceNames. Loading flattened images instead...');
    loadImagesIntoPiskel(externalEditorInput);
    return;
  }

  // Create a Piskel Document from the saved Piskel data that was stored by GDevelop.
  pskl.utils.serialization.Deserializer.deserialize(
    receivedPiskelData,
    piskel => {
      piskelController.setPiskel(piskel);

      // Set piskel frames original data to their saved data counterpart - on all layers.
      piskelController.getLayers().forEach(layer => {
        layer.getFrames().forEach((frame, index) => {
          frame.originalResourceName = savedResourceNames[index];

          // Find the resource with this name, so that we can also restore the
          // localFilePath which is used to track the file were to save changes.
          const existingResource = externalEditorInput.resources.find(
            resource => {
              return resource.name === frame.originalResourceName;
            }
          );
          if (existingResource && existingResource.localFilePath)
            frame.originalLocalFilePath = existingResource.localFilePath;

          frame.originalIndex = index;
        });
      });

      // Compare the imported frames - so as to make the layered Piskel Document
      // the same as the changes done in GDevelop without flattening any layers
      let flattenedResourceNames = [];
      externalEditorInput.resources.forEach((resource, frameIndex) => {
        const resourceName = resource.name;
        flattenedResourceNames.push(resourceName);

        // Import any frames that were added in GDevelop (i.e: frames which can't be found
        // in the saved resource names).
        if (!savedResourceNames.includes(resourceName)) {
          pskl.utils.BlobUtils.dataToBlob(
            resource.dataUrl,
            'image/png',
            imageBlob => {
              pskl.utils.FileUtils.readImageFile(imageBlob, image => {
                // Navigate to the position of the new frame.
                piskelController.setCurrentFrameIndex(
                  piskelController.getFrameCount() - 1
                );
                piskelController.addFrameAtCurrentIndex();
                piskelController.selectNextFrame();

                // Import the missing image.
                const currentFrameObj = piskelController.getCurrentFrame();
                pskl.utils.FrameUtils.addImageToFrame(
                  currentFrameObj,
                  image,
                  0,
                  0
                );
                pskl.tools.transform.TransformUtils.center(currentFrameObj);

                // Save the data used to track this image.
                piskelController.getLayers().forEach(layer => {
                  layer.moveFrame(
                    piskelController.getCurrentFrameIndex(),
                    frameIndex
                  );
                  const frame = layer.getFrameAt(frameIndex);
                  frame.originalIndex = frameIndex;
                  frame.originalResourceName = resource.name;
                  frame.originalLocalFilePath = resource.localFilePath;
                });
              });
            }
          );
        }
      });

      // Remove any frames that were removed in GDevelop.
      let framesToDelete = [];
      piskelController
        .getLayers()[0]
        .getFrames()
        .forEach(frame => {
          // The frame was in metadata, but is not in GDevelop frames, if so remove it
          if (
            savedResourceNames.includes(frame.originalResourceName) &&
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
onMessageFromParentEditor('open-external-editor-input', externalEditorInput => {
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
  const pathEditorHeaderDiv = document.getElementById('external-editor-header');
  const externalEditorHeader = createExternalEditorHeader({
    parentElement: pathEditorHeaderDiv,
    editorContentDocument: document,
    onSaveChanges: () => saveToGDevelop(externalEditorHeader),
    onCancelChanges: () => {
      // Tell Piskel we saved the changes so that it does not try to prevent closing the window.
      // We could override the "Unload service" private functions - but it seems even more hacky.
      pskl.app.savedStatusService.onPiskelSaved();
      closeWindow();
    },
    name: externalEditorInput.name,
  });

  // Set piskel to tiled mode when editing a singleFrame object
  pskl.UserSettings.set(
    pskl.UserSettings.SEAMLESS_MODE,
    externalEditorInput.singleFrame
  );

  setTitle('GDevelop Image Editor (Piskel) - ' + externalEditorInput.name);

  // If there were no resources sent by GD, create an empty piskel document
  if (externalEditorInput.resources.length === 0) {
    createEmptyAnimation();
  } else if (externalEditorInput.externalEditorData) {
    // If there is metadata from GD, use it to load the pskl document with frames with layers
    // Note that metadata will be saved only if the user has more than one layers
    loadPiskelDataFromGd(externalEditorInput);

    externalEditorHeader.setOverwriteExistingResource();
  } else {
    // If there are resources, but no metadata, load the images that were received from GD
    loadImagesIntoPiskel(externalEditorInput);

    externalEditorHeader.setOverwriteExistingResource();
  }

  // Remove the list of frames in case we're editing a single frame and not an animation.
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
